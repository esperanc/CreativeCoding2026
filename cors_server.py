#!/usr/bin/env python3
"""
Simple CORS-enabled http server.
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()


if __name__ == '__main__':
    # usage: python cors_server.py [port]
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    
    server_address = ('', port)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    print(f"Serving HTTP on port {port} with CORS enabled...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
