document.addEventListener('DOMContentLoaded', () => {
    initObfuscation();
    initContactForm();
});

/**
 * 1. Obfuscation & Dynamic Injection
 * Prevents scrapers from harvesting email/phone from raw HTML.
 */
function initObfuscation() {
    const user = "Contact";
    const domain = "Sondrup.ca";
    const phone = ["1", "833", "766", "3787"]; // Split parts

    // Contact Gate Injection
    const contactGate = document.getElementById('contact-gate');
    if (contactGate) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = 'Show Contact Info';

        btn.onclick = () => {
            const email = `${user}@${domain}`;
            const formattedPhone = `${phone[0]}-${phone[1]}-${phone[2]}-${phone[3]}`;

            contactGate.innerHTML = `
                <div class="fade-in" style="margin-top: 1rem;">
                    <p><strong>Email:</strong> <a href="mailto:${email}" class="link-protected">${email}</a></p>
                    <p><strong>Toll-Free:</strong> <a href="tel:+${phone.join('')}" class="link-protected">${formattedPhone}</a></p>
                </div>
            `;
        };

        contactGate.appendChild(btn);
    }

    // Resume logic removed by user request


    // Carousel Navigation
    const carousel = document.querySelector('.reviews-carousel');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (carousel && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: -320, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({ left: 320, behavior: 'smooth' });
        });
    }

    // Review Modal Logic
    const modal = document.getElementById('review-modal');
    if (modal) {
        const closeBtn = modal.querySelector('.modal-close');
        const modalBody = modal.querySelector('#modal-body');

        // Open Modal
        document.querySelectorAll('.review-card').forEach(card => {
            card.style.cursor = 'pointer'; // Make it look clickable
            card.addEventListener('click', () => {
                const text = card.querySelector('.review-text').innerText; // Get full text (even if clamped) or specific data attribute
                // Ideally, use the full text. If CSS clamps it, innerText might be truncated? 
                // No, innerText usually gets mostly everything unless visibility:hidden. 
                // Better approach: Clone the content.

                const fullText = card.querySelector('.review-text').innerHTML;
                const stars = card.querySelector('.star-rating').outerHTML;
                const meta = card.querySelector('.meta').outerHTML; // Keep date/author

                modalBody.innerHTML = `
                    <div style="text-align: center; margin-bottom: 1.5rem;">${stars}</div>
                    <div style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem;">${fullText}</div>
                    <div style="text-align: right; color: var(--text-secondary);">${meta}</div>
                `;

                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scroll
            });
        });

        // Close Modal
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });
    }
}

/**
 * 2. Bot Protection (Honeypot + Validation)
 */
function initContactForm() {
    const form = document.getElementById('recruit-form');
    if (!form) return;

    form.onsubmit = function (e) {
        e.preventDefault();

        // Honeypot Check
        const honey = document.getElementById('website_url_honey');
        if (honey && honey.value) {
            console.warn("Bot detected via honeypot.");
            return false; // Silently fail for bots
        }

        // Basic Validation
        const name = form.querySelector('[name="name"]').value;
        const msg = form.querySelector('[name="message"]').value;

        if (name.length < 2 || msg.length < 10) {
            alert("Please provide a valid name and message.");
            return false;
        }

        // Formspree AJAX Submission
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        btn.textContent = "Sending...";
        btn.disabled = true;

        const formData = new FormData(form);

        fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                alert("Thank you, " + name + ". Your message has been sent successfully.");
                form.reset();
                btn.textContent = "Message Sent";
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 3000);
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        alert(data["errors"].map(error => error["message"]).join(", "));
                    } else {
                        alert("Oops! There was a problem submitting your form");
                    }
                    btn.textContent = originalText;
                    btn.disabled = false;
                });
            }
        }).catch(error => {
            alert("Oops! There was a problem submitting your form");
            btn.textContent = originalText;
            btn.disabled = false;
        });
    };
}
