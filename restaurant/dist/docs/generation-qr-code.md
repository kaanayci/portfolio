# Génération QR Code Dynamique

## Description
Sur les tickets de livraison, un QR Code est généré dynamiquement. Lorsqu'il est scanné par le livreur, il lance directement la navigation GPS vers l'adresse du client.

## Implémentation
Nous utilisons la librairie `qrcode` pour générer une image en base64 (Data URI) à la volée.

### Encodage de l'URL
L'URL encodée n'est pas une simple adresse texte, mais une **Universal Link Google Maps** :
```javascript
const address = `${order.address}, ${order.npa} ${order.city}`;
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

// Génération
const dataUrl = await QRCode.toDataURL(mapsUrl, { width: 150 });
```

### Avantage Opérationnel
Cette fonctionnalité réduit les erreurs de saisie d'adresse par les livreurs et fait gagner environ 15-30 secondes par livraison, optimisant la logistique.

## Exemple de code
![alt text](generation-qr-code.png)
