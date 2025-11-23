document.addEventListener('DOMContentLoaded', function() {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            // Set the active class on the correct link
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const navLinks = document.querySelectorAll('nav a');
            navLinks.forEach(link => {
                const linkPage = link.getAttribute('href').split('/').pop() || 'index.html';
                if (linkPage === currentPage) {
                    link.classList.add('active');
                    link.style.display = 'none';
                } else {
                    link.classList.remove('active');
                }
            });

            const menuIcon = document.querySelector('.menu-icon');
            const navLinksContainer = document.querySelector('.nav-links');

            menuIcon.addEventListener('click', () => {
                navLinksContainer.classList.toggle('active');
            });

            document.body.style.opacity = 1;

            const audio = new Audio('audio.mp3');
            audio.volume = 0.3;

            const headerElements = document.querySelectorAll('header a, header button');
            headerElements.forEach(el => {
                el.addEventListener('click', () => {
                    audio.currentTime = 0;
                    audio.play();
                    setTimeout(() => {
                        audio.pause();
                    }, 200);
                });
            });

            const links = document.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        return;
                    }
                    e.preventDefault();
                    document.body.style.transition = 'opacity 0.5s';
                    document.body.style.opacity = 0;
                    setTimeout(() => {
                        window.location.href = href;
                    }, 500);
                });
            });
        })
        .catch(error => console.error('Error fetching header:', error));

    const wordCategories = {
    'X-Intelligence-Qualities': ['Analytical Thinking', 'Problem Solving', 'Critical Reasoning', 'Quick Learning', 'Trend-Analysis', 'Logical Deduction', 'Strategic Planning'],
    'X-Humor-Qualities': ['Playful', 'Storytelling'],
    'X-Hobbies': ['Reading', 'Gaming', 'Tech'],
    'X-Gaming-Genres': ['Strategic', 'Puzzles', 'Racing', 'Adventure', 'MMORPG'],
    'X-Tech-Areas': ['Programming', 'AI/ML', 'Web Development'],
    'X-Personality-Traits': ['Curious', 'Generalist', 'Funny', 'Tech Savvy']
    };

    function getRandomWord(category) {
        const words = wordCategories[category];
        return words[Math.floor(Math.random() * words.length)];
    }    

    function updateSubtitle() {
        const subtitleElement = document.querySelector('.lead');
        if (subtitleElement) {
            const categories = Object.keys(wordCategories);
            // Shuffle categories to get a random mix
            const shuffledCategories = categories.sort(() => 0.5 - Math.random());
            const selectedCategories = shuffledCategories.slice(0, 3);
            const newSubtitle = selectedCategories.map(category => getRandomWord(category)).join(', ');
            subtitleElement.textContent = newSubtitle;
            subtitleElement.className = 'lead ' + selectedCategories.join(' ');
        }
    }

    // Update the sub head every 10 seconds
    setInterval(updateSubtitle, 10000);

    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
            // Fetch and display a random quote once the footer is loaded
            loadQuotes();
        })
        .catch(error => console.error('Error fetching footer:', error));

    let quotesData = [];

function parseModifiedCSV(csv) {
    const lines = csv.trim().split('\n'); // Split by new line and trim
    const result = [];

    // Extract headers
    const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));

    // Find indices for Author and Quote columns (should be 0 and 1 in modified CSV)
    const authorIndex = headers.indexOf('Author');
    const quoteIndex = headers.indexOf('Quote');

    for (let i = 1; i < lines.length; i++) {
        // Split line by comma respecting quoted commas using regex
        const parts = lines[i].match(/(".*?"|[^",]+)(?=s*,|s*$)/g);

        if (parts && parts.length >= 2) {
            const author = parts[authorIndex].replace(/^"|"$/g, '').trim();
            const quote = parts[quoteIndex].replace(/^"|"$/g, '').trim();

            if (author && quote) {
                result.push({ author, quote });
            }
        }
    }
    return result;
}

    function loadQuotes() {
        fetch('quotes_author.csv')
            .then(response => response.text())
            .then(csv => {
                quotesData = parseModifiedCSV(csv);
                showRandomQuote(); // Display a quote immediately after loading

                // Refresh quote every 5 seconds
                setInterval(showRandomQuote, 5000);

                // Add click listener to refresh quote
                const quoteDisplay = document.getElementById('quoteDisplay');
                quoteDisplay.style.cursor = 'pointer';
                quoteDisplay.addEventListener('click', showRandomQuote);
            })
            .catch(error => console.error('Error fetching quotes:', error));
    }

    window.showRandomQuote = function() {
      if (quotesData.length === 0) {
        document.getElementById('quoteDisplay').textContent = 'No quotes loaded.';
        return;
      }
      const randomIndex = Math.floor(Math.random() * quotesData.length);
      const quote = quotesData[randomIndex];
      document.getElementById('quoteDisplay').textContent = `${quote.quote} - ${quote.author}`;
    }

    if (document.body.classList.contains('blog')) {
        const blogPostsContainer = document.getElementById('blog-posts');
        blogPostsContainer.innerHTML = '<p>Fetching posts...xD</p>';

        fetch('https://public-api.wordpress.com/rest/v1.1/sites/inknowhere.wordpress.com/posts/?fields=URL,title,excerpt,featured_image')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not o🤐 ok ok o😶‍🌫️ ok ok *x* 😵');
                }
                return response.json();
            })
            .then(data => {
                blogPostsContainer.innerHTML = ''; // Clear loading message
                const posts = data.posts;
                if (posts && posts.length > 0) {
                    const projectsList = document.createElement('div');
                    projectsList.className = 'projects-list';

                    posts.forEach(post => {
                        const postElement = document.createElement('a');
                        postElement.href = post.URL;
                        postElement.classList.add('project', 'card');
                        postElement.style.textDecoration = 'none';
                        postElement.style.color = 'inherit';
                        postElement.target = '_blank';
                        postElement.rel = 'noopener noreferrer';

                        let imageHTML = '';
                        if (post.featured_image) {
                            imageHTML = `<img src="${post.featured_image}" alt="" style="width: 100%; height: auto; display: block; margin-bottom: 1em; border-radius: 5px;">`;
                        }

                        postElement.innerHTML = `
                            ${imageHTML}
                            <div class="left">
                                <h3 style="margin-top:0;">${post.title}</h3>
                                <div class="muted">${post.excerpt}</div>
                            </div>
                            <div style="text-align:right; margin-top: 1em;">
                                <span class="chip">Read More</span>
                            </div>
                        `;
                        projectsList.appendChild(postElement);
                    });
                    blogPostsContainer.appendChild(projectsList);
                } else {
                    blogPostsContainer.innerHTML = '<p>No posts found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching blog posts:', error);
                blogPostsContainer.innerHTML = '<p>Failed to load posts. Visit blog directly please.</p>';
            });
        }
});

                    
