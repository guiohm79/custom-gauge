class CustomGaugeCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error("Entité non définie.");
    }

    this.config = config;
    this.attachShadow({ mode: "open" });
    this.render();
  }

  set hass(hass) {
    this._hass = hass;

    const entityState = this._hass.states[this.config.entity];
    const state = parseFloat(entityState?.state || "0");

    // Lire le min et le max de la configuration YAML
    const min = this.config.min || 0;
    const max = this.config.max || 100;

    // Calculer le pourcentage en fonction de la plage
    const ledsCount = this.config.leds_count || 100;
    const normalizedValue = ((state - min) / (max - min)) * 100; // Convertir en pourcentage

    // Mettre à jour les LEDs et l'ombre extérieure
    this._updateLeds(normalizedValue, ledsCount);

    // Mettre à jour l'ombre au centre
    this._updateCenterShadow(normalizedValue);

    // Mettre à jour la valeur et l'unité affichées
    const valueDisplay = this.shadowRoot.querySelector(".value");
    const unitDisplay = this.shadowRoot.querySelector(".unit");
    if (valueDisplay) valueDisplay.textContent = state.toFixed(this.config.decimals || 0);
    if (unitDisplay) unitDisplay.textContent = this.config.unit || "";
  }

  render() {
    const ledsCount = this.config.leds_count || 100; // Nombre de LEDs défini dans YAML
    const gaugeHTML = `
      <style>
        .gauge-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
          background: #222;
          border-radius: 15px;
          padding: 16px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.5); /* Ombre de base */
          cursor: pointer;
          transition: box-shadow 0.3s ease-in-out; /* Transition pour effet dynamique */
        }
        .gauge {
          position: relative;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, #444, #222);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .center-shadow {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0));
          box-shadow: none; /* Par défaut, pas d'ombre */
          transition: box-shadow 0.3s ease-in-out;
        }
        .led {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #333; /* Couleur par défaut assombrie */
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.8); /* Réduction de l'effet d'ombre */
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }
        .led.active {
          box-shadow: 0 0 8px currentColor, inset 0 0 3px currentColor;
        }
        .center {
          position: absolute;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, #333, #111);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
          font-weight: bold;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }
        .value {
          font-size: 32px;
        }
        .unit {
          font-size: 16px;
          color: #ddd;
        }
        .title {
          margin-top: 10px;
          font-size: 16px;
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }
      </style>
      <div class="gauge-card" id="gauge-container">
        <div class="gauge">
          <div class="center-shadow" id="center-shadow"></div>
          ${Array.from({ length: ledsCount })
            .map(
              (_, i) =>
                `<div class="led" id="led-${i}" style="transform: rotate(${(i / ledsCount) * 360}deg) translate(100px);"></div>`
            )
            .join("")}
          <div class="center">
            <div class="value">0</div>
            <div class="unit"></div>
          </div>
        </div>
        <div class="title">${this.config.name || ""}</div>
      </div>
    `;

    this.shadowRoot.innerHTML = gaugeHTML;

    // Ajouter l'écouteur de clic pour afficher l'historique
    this.shadowRoot
      .getElementById("gauge-container")
      .addEventListener("click", () => this._showEntityHistory());

    // Initialiser toutes les LEDs à l'état inactif
    this._updateLeds(0, ledsCount);
  }

  _updateLeds(value, ledsCount) {
    const activeLeds = Math.round((value / 100) * ledsCount);
    const color = this._getLedColor(value);

    if (this.config.enable_shadow) {
      const gaugeContainer = this.shadowRoot.getElementById("gauge-container");
      gaugeContainer.style.boxShadow = `0 0 30px 2px ${color}`;
    }

    for (let i = 0; i < ledsCount; i++) {
      const led = this.shadowRoot.getElementById(`led-${i}`);
      if (i < activeLeds) {
        led.style.background = `radial-gradient(circle, rgba(255, 255, 255, 0.8), ${color})`;
        led.style.boxShadow = `0 0 8px ${color}`;
        led.classList.add("active");
      } else {
        led.style.background = "#333";
        led.style.boxShadow = "none";
        led.classList.remove("active");
      }
    }
  }

  _updateCenterShadow(value) {
    if (!this.config.center_shadow) return;
  
    const color = this._getLedColor(value);
    const blur = this.config.center_shadow_blur || 30; // Valeur par défaut : 30px
    const spread = this.config.center_shadow_spread || 15; // Valeur par défaut : 15px
    const centerShadow = this.shadowRoot.getElementById("center-shadow");
    
    centerShadow.style.boxShadow = `0 0 ${blur}px ${spread}px ${color}`;
  }
  

  _getLedColor(value) {
    const severity = this.config.severity || [
      { color: "#4caf50", value: 20 },
      { color: "#ffeb3b", value: 50 },
      { color: "#f44336", value: 100 },
    ];

    for (const zone of severity) {
      if (value <= zone.value) {
        return zone.color;
      }
    }

    return "#555";
  }

  _showEntityHistory() {
    if (!this.config.entity || !this._hass) return;

    const event = new Event("hass-more-info", { bubbles: true, composed: true });
    event.detail = { entityId: this.config.entity };
    this.dispatchEvent(event);
  }
}

customElements.define("custom-gauge-card", CustomGaugeCard);
