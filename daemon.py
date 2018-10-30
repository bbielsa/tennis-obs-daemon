#!/bin/python3

import http.server
import socketserver
import argparse
import os
import json

from http.server import BaseHTTPRequestHandler

parser = argparse.ArgumentParser(description='')
parser.add_argument('--listen_port', type=int, required=True)

args = parser.parse_args()

def is_running():
    result = os.system('./query_obs.sh')

    return result != 0

class OBSRequestHandler(BaseHTTPRequestHandler):
    def respond(self, val):
        self.send_response(200)

        self.send_header('Content-Type', 'text/html')
        self.end_headers()
        self.wfile.write(bytes(json.dumps(val), 'ascii'))

    def do_GET(self):
        if self.path == '/query':
            self.respond({ 'running': is_running() })
        else:
            if self.path == '/start':
                if is_running():
                    self.respond({ 'success': True, 'message': 'already running' })
                else:
                    os.system('./start_obs.sh')

                    self.respond({ 'success': True })

            if self.path == '/stop':
                if is_running():
                    os.system('./stop_obs.sh')

                    self.respond({ 'success': True })
                else:
                    self.respond({ 'success': True, 'message': 'not running' })

with socketserver.TCPServer(('', args.listen_port), OBSRequestHandler) as httpd:
    httpd.serve_forever()
