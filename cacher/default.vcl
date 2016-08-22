# Caches results from hoster and allows PURGE on cache
#CONSIDER: only allow GET HEAD OPTIONS & PURGE

backend default {
    .host = "hoster";
    .port = "8000";
}

sub vcl_recv {
   set req.http.X-Forwarded-Host = req.http.host;

   #start the default vcl_recv
   if (req.restarts == 0) {
    	if (req.http.x-forwarded-for) {
   	     set req.http.X-Forwarded-For =
   	 	req.http.X-Forwarded-For + ", " + client.ip;
   	 } else {
   	     set req.http.X-Forwarded-For = client.ip;
   	 }
   }

   #allow purging
   if (req.request == "PURGE") {
        if (! req.http.Authorization ~ "Token ${PURGE_TOKEN}") {
              error 405 "Method not allowed";
        }
        return (lookup);
   }

   if (req.request != "GET" &&
     req.request != "HEAD" &&
     req.request != "PUT" &&
     req.request != "POST" &&
     req.request != "TRACE" &&
     req.request != "OPTIONS" &&
     req.request != "DELETE") {
       /* Non-RFC2616 or CONNECT which is weird. */
       return (pipe);
   }
   if (req.http.Upgrade ~ "(?i)websocket") {
       /* Websocket request */
       return (pipe);
   }
   if (req.request != "GET" && req.request != "HEAD") {
       /* We only deal with GET and HEAD by default */
       return (pass);
   }
   if (req.http.Authorization || req.http.Cookie) {
       /* Not cacheable by default */
       # use Vary Cookie if need be
       #return (pass);
   }
   return (lookup);
}

sub vcl_pipe {
   # Note that only the first request to the backend will have
   # X-Forwarded-For set.  If you use X-Forwarded-For and want to
   # have it set for all requests, make sure to have:
   # set bereq.http.connection = "close";
   # here.  It is not set by default as it might break some broken web
   # applications, like IIS with NTLM authentication.
    if (req.http.upgrade) {
        set bereq.http.upgrade = req.http.upgrade;
    }
}

sub vcl_hit {
    if (req.request == "PURGE") {
        purge;
        error 200 "Purged";
    }
}
sub vcl_miss {
    if (req.request == "PURGE") {
        purge;
        error 200 "Not in cache";
    }
}
sub vcl_pass {
    if (req.request == "PURGE") {
        error 200 "PURGE on a passed object";
    }
}
