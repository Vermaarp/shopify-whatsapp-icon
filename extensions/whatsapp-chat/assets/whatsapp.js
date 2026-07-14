(function() {
  document.addEventListener("DOMContentLoaded", function() {
    const initWhatsAppWidget = async () => {
      const embedBlock = document.getElementById('whatsapp-chat-button');
      if (!embedBlock) return;

      const data = embedBlock.dataset;
      if (!data.shopDomain) return;

      // Default settings
      let s = {
        phone: '',
        message: "Hi, I'm interested in [product_title] - [product_url]",
        color: '#25D366',
        position: 'bottom-right',
        icon: 'whatsapp',
        isActive: true,
        animation: 'pulse',
        size: 'medium',
        tooltipEnabled: true,
        shadow: 'medium',
        borderRadius: 50,
        delay: 0,
        customCss: ''
      };

      // Fetch dynamic settings from app backend
      try {
        const res = await fetch(`/apps/whatsapp/settings?shop=${data.shopDomain}`);
        if (res.ok) {
           const json = await res.json();
           if (json.settings) {
              if (!json.settings.isActive) return; // Disabled from admin
              
              s.phone = json.settings.phoneNumber || s.phone;
              s.message = json.settings.welcomeMessage || s.message;
              s.color = json.settings.buttonColor || s.color;
              s.position = json.settings.position || s.position;
              s.icon = json.settings.icon || s.icon;
              s.animation = json.settings.animation || s.animation;
              s.size = json.settings.buttonSize || s.size;
              s.tooltipEnabled = json.settings.tooltipEnabled !== undefined ? json.settings.tooltipEnabled : s.tooltipEnabled;
              s.shadow = json.settings.shadow || s.shadow;
              s.borderRadius = json.settings.borderRadius !== undefined ? json.settings.borderRadius : s.borderRadius;
              s.delay = json.settings.delaySeconds !== undefined ? json.settings.delaySeconds : s.delay;
              s.customCss = json.settings.customCss || s.customCss;
           }
        }
      } catch (e) {
        console.error('Error loading WhatsApp settings:', e);
        return; // Need settings to proceed
      }

      if (!s.phone) return; // Must have phone number

      // Inject Custom CSS
      if (s.customCss) {
        const styleTag = document.createElement('style');
        styleTag.innerHTML = s.customCss;
        document.head.appendChild(styleTag);
      }

      // Replace variables in message
      let message = s.message;
      message = message.replace('[product_title]', data.productTitle || '');
      message = message.replace('[product_url]', data.productUrl ? window.location.origin + data.productUrl : window.location.href);
      message = message.replace('[product_price]', data.productPrice || '');
      message = message.replace('[shop_name]', data.shopName || '');
      message = message.replace('[current_url]', data.currentUrl ? window.location.origin + data.currentUrl : window.location.href);

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${s.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

      const container = document.createElement('div');
      container.id = 'whatsapp-chat-button-container';
      container.className = s.position;

      const anchor = document.createElement('a');
      anchor.href = whatsappUrl;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.className = `wa-btn wa-btn-${s.size} wa-shadow-${s.shadow} wa-anim-${s.animation}`;
      anchor.style.backgroundColor = s.color;
      anchor.style.borderRadius = `${s.borderRadius}px`;

      // Custom PNG or SVG Icon for WhatsApp
      if (s.icon === 'custom' && data.customIconUrl) {
        anchor.innerHTML = `<img src="${data.customIconUrl}" alt="WhatsApp" style="width: 100%; height: 100%; object-fit: contain; border-radius: inherit;" />`;
      } else {
        anchor.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.031 0C5.4 0 0 5.4 0 12.031c0 2.634.843 5.093 2.302 7.126L.742 24l4.981-1.534A11.956 11.956 0 0012.031 24c6.63 0 12.031-5.4 12.031-12.031S18.66 0 12.031 0zm6.545 17.266c-.282.784-1.637 1.488-2.28 1.558-.59.066-1.378.138-2.306-.164-.566-.184-1.332-.47-2.316-.884-4.17-1.758-6.84-6.02-7.043-6.294-.202-.27-1.68-2.235-1.68-4.26s1.052-3.003 1.417-3.376c.367-.374.79-.467 1.053-.467.262 0 .524.004.757.016.242.012.568-.093.886.67.332.802 1.135 2.767 1.233 2.965.1.198.167.432.035.694-.13.262-.2.427-.396.657-.197.23-.408.498-.588.68-.202.206-.412.433-.178.832.233.398 1.037 1.706 2.22 2.76 1.528 1.362 2.802 1.782 3.2 1.98.398.198.63.167.864-.103.234-.27.994-1.163 1.258-1.564.262-.4.524-.334.887-.198.366.136 2.302 1.085 2.698 1.284.398.198.663.297.76.463.1.166.1.957-.18 1.74z"/></svg>`;
      }
      
      // Tracking on click
      anchor.addEventListener('click', function() {
         fetch('/apps/whatsapp/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: window.location.href,
              productTitle: data.productTitle,
              shop: data.shopName
            })
         }).catch(e => console.error(e));
      });

      if (s.tooltipEnabled) {
        const tooltip = document.createElement('div');
        tooltip.className = 'wa-tooltip';
        tooltip.innerText = 'Need Help?';
        container.appendChild(tooltip);
      }
      
      container.appendChild(anchor);
      document.body.appendChild(container);

      setTimeout(() => {
        container.classList.add('show');
      }, s.delay * 1000);

    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(initWhatsAppWidget);
    } else {
      setTimeout(initWhatsAppWidget, 100);
    }
  });
})();
