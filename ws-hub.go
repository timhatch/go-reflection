// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"log"
)

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	clients    map[*Client]bool // Registered clients.
	broadcast  chan []byte      // Inbound messages from the clients.
	register   chan *Client     // Register requests from the clients.
	unregister chan *Client     // Unregister requests from clients.
}

func New() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) run() {
	for {
		select {
		// Handle a connection from the hub register channel
		case client := <-h.register:
			log.Println("Client connection")

			h.clients[client] = true

		// Handle a disconnection from the hub unregister channel
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				log.Println("Client disconnection")

				delete(h.clients, client)
				close(client.send)
			}

		// Handle a message received from *any* client on the hub broadcast channel
		// Send to all clients
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
					// log.Println("Message routed to client.send channel as []byte of length: ", len(message), "B")
				default:
					log.Println("debug message to see when default is called")
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}
