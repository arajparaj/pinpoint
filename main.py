import os
import webapp2
import cgi
import datetime
import urllib
import time
from random import choice
import json
from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.api import images
from google.appengine.ext import blobstore, webapp
from google.appengine.ext.webapp import blobstore_handlers, template
from google.appengine.runtime.apiproxy_errors import CapabilityDisabledError



class Wrapper(db.Model):
    user = db.UserProperty(auto_current_user=True)
    blob = blobstore.BlobReferenceProperty(required=True)
    date = db.DateTimeProperty(auto_now_add=True)
    lat  = db.StringProperty(required=True)
    lon  = db.StringProperty(required=True)
    pname = db.StringProperty(required=True)

class Comments(db.Model):
    user = db.UserProperty(auto_current_user=True)
    date = db.DateTimeProperty(auto_now_add=True)
    comm  = db.StringProperty(required=True)
    lat  = db.StringProperty(required=True)
    lon  = db.StringProperty(required=True)

class MainPage(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if user:
            link = users.create_logout_url('/')
            values = {
                'logout': link,
                'upload_url' : blobstore.create_upload_url('/upload'),
                'wrappers' : Wrapper.all()
            }
            path = os.path.join(os.path.dirname(__file__), 'templates/home.html')
            self.response.out.write(template.render(path, values))
        else:
            link = users.create_login_url('/')
            values = {
                'login': link,
            }
            path = os.path.join(os.path.dirname(__file__), 'templates/index.html')
            self.response.out.write(template.render(path, values))


class comHandler(webapp2.RequestHandler):
        def post(self):
            la=self.request.get('lat')
            lo=self.request.get('lon')
            txt=self.request.get('text')
            Comments(comm=txt, lat=la, lon=lo).put()
            


class UploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        try:
            upload_files = self.get_uploads('file')
            if len(upload_files) > 0:
                blob_info = upload_files[0]
                latit = self.request.get('lat')
                longi = self.request.get('lng')
                pame = self.request.get('pame')
                Wrapper(blob=blob_info.key(), lat=latit, lon=longi,pname=pame).put()
            self.redirect('/redirect')
        except CapabilityDisabledError:
            self.response.out.write('Uploading disabled')

class ServeHandler(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, resource):
        user = users.get_current_user()
        if user:
            resource = str(urllib.unquote(resource))
            blob_info = blobstore.BlobInfo.get(resource)
            self.send_blob(blob_info)
        else: self.redirect('/')

class DeleteHandler(webapp2.RequestHandler):
    def post(self):
        try:
            key = self.request.get("key")
            wrapper = Wrapper.get(key)
            if wrapper:
                if wrapper.blob:
                    blobstore.delete(wrapper.blob.key())
                else: self.response.out.write('No blob in wrapper')
                db.delete(wrapper)
                self.response.out.write('deleted<br><a href="/newupload">Go back</a>')
            else: self.response.out.write('No wrapper for key %s' % key)
        except CapabilityDisabledError:
            self.response.out.write('Deleting disabled')

class picHandler(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if user:
            link = users.create_logout_url('/')
            la = str(self.request.get("la"))
            ln = str(self.request.get("ln"))
            q = Wrapper.gql("WHERE lat = '%s' AND lon = '%s'" % (la,ln))
            r = Comments.gql("WHERE lat = '%s' AND lon = '%s'" % (la,ln))
            values = {
                'logout': link,
                'wrappers' : q,
                'latit' : la,
                'longi' : ln,
                'comments':r,
                'usname':users.get_current_user()
            }
            path = os.path.join(os.path.dirname(__file__), 'templates/pic.html')
            self.response.out.write(template.render(path, values))
        else: self.redirect('/')
class redHandler(webapp2.RequestHandler):
    def get(self):
        values = {}
        path = os.path.join(os.path.dirname(__file__), 'templates/redirect.html')
        self.response.out.write(template.render(path, values))
        


application = webapp2.WSGIApplication([('/', MainPage),
  ('/upload', UploadHandler),
  ('/serve/([^/]+)?', ServeHandler),
  ('/pic', picHandler),
  ('/comment', comHandler),
  ('/redirect', redHandler),
  ('/delete', DeleteHandler)], debug=True)