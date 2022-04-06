package main

import (
	"log"
	"net/http"
	"os"
)

type app struct{}

// serveWs handles websocket requests from the peer.
func serveWsChat(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256)}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}

func main() {
	port, ok := os.LookupEnv("PORT")

	if !ok {
		port = "80"
	}

	// Create and run the message handling hub
	// Implementation ile: ./hub.go
	hub := New()
	go hub.run()

	// Handle static files from a non-standard location
	fs := http.FileServer(http.Dir("public/"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// route `/`
	// Handle http connections
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Deny requests to anything other than the root URL
		if r.URL.Path != "/" {
			http.Error(w, "Not found", http.StatusNotFound)
			return
		}

		http.ServeFile(w, r, "./public/index.html")
	})

	http.HandleFunc("/index.html", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./public/index.html")
	})

	http.HandleFunc("/client.html", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./public/client.html")
	})

	http.HandleFunc("/timers.html", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./public/timers.html")
	})

	// route `/ws`
	// Handle clients connecting to the `/ws` route
	// Implementation file: ./client.go
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWsChat(hub, w, r)
	})

	log.Printf("Starting server on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
