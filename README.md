# weather_station
*a simple domestic measurements system*

### Intro
**weather_station** è un insieme di componenti che consentono di catturare dati di umidità e temperatura tramite un sensore DHT11/22 collegato ad un raspberry pi, di immagazzinare le misurazioni effettuate nel tempo su un database mongodb, quindi estrapolare tali informazioni e mostrarle all'utente tramite una web_app realtime costruita su node.js + socket.io (lato server) e jquery + bootstrap per la logica di presentazione su browser. Per maggiori dettagli sul funzionamento generale rimando al *tutorial* pubblicato sul mio blog (https://geekonerd.blogspot.com/2018/10/tutorial-come-costruire-una-stazione-meteorologica-casalinga-con-raspberry-pi.html).

#### Contenuto
Sono compresi:
- la web-app HTML+JS per la visualizzazione dei dati sottoforma di grafico (chart.js + moment.js)
- il codice python per effettuare le misurazioni
- il codice javascript per tirare su il server node.js che gestisce tutta l'architettura (dall'inserimento dei dati su mongodb alla sua estrapolazione e invio ai client connessi ad esso real-time tramite socket.io)

###### Nota bene
Il codice presente in questo repository funziona su un Raspberry Pi configurato come descritto nel tutorial. Nella versione attuale, si tratta di una *demo* che può essere utilizzata senza problemi in locale, ma ne è sconsigliato l'uso *as is* se esposta su Internet.
