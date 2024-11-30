# custom-gauge
dashboard homeassistant
# Custom Gauge Card for Home Assistant

![image](https://github.com/user-attachments/assets/61cc21ca-180b-4d35-9cb6-a8933ac2a69e)

Une carte de jauge personnalisée pour Home Assistant, permettant d'afficher des entités sous forme de jauges circulaires avec des effets dynamiques (ombres, LEDs, etc.) et un contrôle avancé via YAML.

## Fonctionnalités principales

- **Affichage des entités sous forme de jauge circulaire**.
- **LEDs dynamiques :** Les LEDs s'allument en fonction de la valeur de l'entité.
- **Couleur basée sur `severity` :** Change automatiquement selon les seuils définis dans le YAML.
- **Effets d'ombre personnalisables :**
  - Ombre extérieure activable/désactivable.
  - Ombre autour du centre configurable.
- **Support des plages de valeurs personnalisées (`min` et `max`).**
- **Affichage de l'historique de l'entité au clic.**

---

## Installation

### 1. Télécharger le fichier JavaScript
Clone ou télécharge ce dépôt sur votre instance Home Assistant. Place le fichier `custom-gauge-card.js` dans le répertoire suivant :


### 2. Ajouter la ressource dans Home Assistant
Ajoute la ressource JavaScript dans ton tableau de bord Lovelace :

1. Va dans **Paramètres > Tableau de bord > Ressources > Ajouter une ressource**.
2. Ajoute le chemin suivant :

3. Sélectionne le type : **Module**.

### 3. Redémarre Home Assistant
Redémarre Home Assistant pour que les changements soient pris en compte.

---

## Utilisation

Voici un exemple d'utilisation dans votre tableau de bord YAML :

```yaml
type: custom:custom-gauge-card
entity: sensor.niveaux_cuves_capteur_niveau_cuve_1
name: Niveau cuve 1
unit: L
min: 0
max: 3000
leds_count: 150
decimals: 0
enable_shadow: true
center_shadow: true
center_shadow_blur: 50 # Flou de l'ombre centrale
center_shadow_spread: 10 # Expansion de l'ombre centrale
shadow_direction: outward # Ombre vers l'extérieur (inward pour l'intérieur)
severity:
- color: "#ff2d00" # Rouge pour les faibles niveaux (jusqu'à 25 %)
 value: 25
- color: "#fb8804" # Orange pour les niveaux moyens (jusqu'à 50 %)
 value: 50
- color: "#04fb1d" # Vert pour les niveaux élevés (jusqu'à 100 %)
 value: 100
