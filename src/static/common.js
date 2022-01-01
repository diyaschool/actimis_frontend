api_server_endpoint = ""

function raw_api_req(args){
  $.ajax({
    type: args['type'],
    url: api_server_endpoint+args['url'],
    data: JSON.stringify(args['data']),
    contentType: "application/json",
    dataType: 'json',
    success: function (data) {args['success'](data)},
    error: function (data) {args['error'](data.responseJSON)}
  })
}

function package_update(success){
  $.ajax({
    type: "GET",
    url: "/static/package.json",
    success: function (data){
      data["update_time"] = new Date().getTime()
      localStorage.setItem("package_data", JSON.stringify(data))
      success(data);
    }
  })
}

function package(next){
 package_data = JSON.parse(localStorage.getItem("package_data"))
 if (package_data == null) {
   package_update(next)
   console.log("package_data not found, updating...");
 } else {
   update_diff = new Date().getTime() - package_data["update_time"]
   if (update_diff > 86400000) { // 24 hours
     package_update(next)
     console.log("package_data expired, updating...");
   } else {
     next(package_data)
   }
 }
}

function api_req(type, url, data, success, error) {
  data['token'] = localStorage.getItem("token")
  if (data['token'] == null) {
    error({"error": "TOKEN_MISSING"})
    return
  }
  raw_api_req({type:type,
    url: url,
    data: data,
    success: success,
    error: error
    })
}

package(function (data){
  api_server_endpoint = data["api_server_endpoint"]
})

api_req("POST", "/auth/test/", {}, function (data){
  if (window.location.pathname == "/login/"){
    window.location.replace("/");
  }
}, function (data){
  if (data['error'] != "TOKEN_MISSING") {
    localStorage.removeItem('token')
  }
  if (window.location.pathname != "/login/"){
      window.location.replace("/login/");
  }
})
