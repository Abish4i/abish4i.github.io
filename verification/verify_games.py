from playwright.sync_api import sync_playwright, expect
import time

def verify_games():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = context.new_page()

        # 1. Navigate to games.html
        print("Navigating to games.html...")
        page.goto("http://localhost:8080/games.html")

        # Wait for header and footer to load (approximate check)
        # Note: In a real app we'd wait for a specific element from the header/footer
        time.sleep(1) # Allow fetches to complete

        # Check title
        expect(page).to_have_title("Abhishek Sengar — Game Center")

        # Take screenshot of Main Menu
        print("Taking screenshot of Main Menu...")
        page.screenshot(path="verification/games_menu.png")

        # 2. Test Tic Tac Toe
        print("Opening Tic Tac Toe...")
        page.click("button[onclick=\"openGame('tictactoe')\"]")
        time.sleep(0.5)
        # Verify modal is visible
        tictactoe_area = page.locator("#tictactoe-area")
        expect(tictactoe_area).to_be_visible()
        # Verify screen text
        status_screen = page.locator("#status-screen")
        expect(status_screen).to_contain_text("Playing: Tic Tac Toe")

        # Make a move
        page.click(".cell >> nth=0") # Click first cell
        time.sleep(0.1)
        # Verify X is placed
        first_cell = page.locator(".cell").first
        expect(first_cell).to_have_text("X")

        page.screenshot(path="verification/games_tictactoe.png")

        # 3. Test Snake
        print("Opening Snake...")
        page.click("button[onclick=\"openGame('snake')\"]")
        time.sleep(0.5)
        snake_area = page.locator("#snake-area")
        expect(snake_area).to_be_visible()
        expect(status_screen).to_contain_text("Playing: Snake")
        page.screenshot(path="verification/games_snake.png")

        # 4. Test 2048
        print("Opening 2048...")
        page.click("button[onclick=\"openGame('game2048')\"]")
        time.sleep(0.5)
        area_2048 = page.locator("#area-2048")
        expect(area_2048).to_be_visible()

        # Check for either "Playing: 2048" or "2048 Score:" depending on load speed
        # Actually init2048 updates it immediately to Score.
        expect(status_screen).to_contain_text("2048 Score:")

        # Verify tiles exist
        tiles = page.locator(".tile-2048")
        count = tiles.count()
        if count != 16:
            print(f"Warning: Expected 16 tiles, found {count}")

        page.screenshot(path="verification/games_2048.png")

        browser.close()
        print("Verification complete.")

if __name__ == "__main__":
    verify_games()
