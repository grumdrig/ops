exports.rpc = function(vars) {
  post("https://browserid.org/verify",
       {assertion: vars.assertion, audience:"grumdrig.com"},
       function (response) {  respond(response);  },
       function (error) {  respond({status:"Auth request failed"});  });
};