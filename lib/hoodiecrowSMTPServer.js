"use strict";

var SMTPServer = require("smtp-server").SMTPServer;

/***
 * Starts simpleSMTP server, passing parsed email messages along to the
 * hoodiecrow IMAP server as a new message in the INBOX.
 *
 * Note: Interprets data chunks coming out of simpleSMTP to fix dot escaping
 * issue that is liable to leave duplicated dots in emails
 *
 *
 * @param {Number} smtpPort - port to listen on for SMTP commands
 * @param {Object} imapServer - the hoodiecrow IMAP server
 * @param {Function} callback - function executed when SMTP server is listening
 */
exports.startSMTPServer = function startSMTPServer(smtpPort, imapServer, callback) {
    var server = new SMTPServer({
      banner:"Hoodiecrow",
      authOptional: true,
      onData(req, session, callback) {
        var data = [], dataLen = 0;
        req.on("data", function(chunk){
            if(!chunk || !chunk.length){
                return;
            }
            data.push(chunk);
            dataLen += chunk.length;
        });
        req.on("end", function(){
            var message = Buffer.concat(data, dataLen);

            imapServer.appendMessage("INBOX", [], false, message.toString("binary"));
            callback();
        });
      }
    });
    
    server.listen(smtpPort, function(){
        console.log("Incoming SMTP server up and running on port %s", smtpPort);
        if (callback) {
            return callback();
        }
    });

    return server;
  
};
