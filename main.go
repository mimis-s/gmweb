package main

import (
	"embed"
	"flag"

	"github.com/mimis-s/gmweb/router"
)

var (
	listenPort = flag.String("listenPort", ":8484", "server listen address")
)

//go:embed templates
var htmlEmbed embed.FS

//go:embed assets
var assetsEmbed embed.FS

func main() {
	flag.Parse()
	port := "8484"
	if listenPort != nil && *listenPort != "" {
		port = *listenPort

	}
	router.Start(":"+port, htmlEmbed, assetsEmbed)
}
