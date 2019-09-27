var mcMethod = mcMethod || {};
mcMethod.url = {
  queryActivityById: 'api/activity/v1/queryActivityById'
};
mcMethod.info = {
  companyId: 'root',
  appCode: 'emp',
  userId: '5d8cf2c205a9b43d88fb3b63',
  serviceCode: 'cloudemp',
  versionId: '1'
};
mcMethod.query = {};
mcMethod.query.request = function (option) {
  if (this instanceof mcMethod.query.request) {
    this.init(option)
  } else {
    new mcMethod.query.request(option)
  }
};
mcMethod.query.request.prototype.init = function (option) {
  try {
    var self = this;
    var timestamp = Date.parse(new Date());
    this.json = "";
    this.queryType = option.queryType || "POST";
    this.companyId = option.companyId || "";
    this.appCode = option.appCode || "";
    this.userId = option.userId || "";
    this.productId = option.productId || "";
    this.serviceCode = option.serviceCode || "";
    this.token = option.token || "formClueService";
    this.timeStamp = option.timeStamp || timestamp;
    this.cloudUrl = option.cloudUrl || CONFIG.cloudUrl;
    this.async = option.async || true;
    this.data = option.data || {};
    this.url = option.url;
    this.callback = option.callback || function () {
    };
    this.errorCallback = option.errorCallback || function () {
    };
    this.address = option.address || '';
    var urlParam = {
      companyId: self.companyId,
      appCode: self.appCode,
      userId: self.userId,
      serviceCode: self.serviceCode,
      token: self.token,
      timeStamp: self.timeStamp
    };
    if (self.address != undefined && self.address != "") {
      urlParam["address"] = self.address;
    }
    var _selfUrl = self.cloudUrl + self.url + self.getCommonUrlParam(urlParam);
    if (this.queryType == "GET") {
      urlParam['data'] = self.data;
      self.data = "";
    } else {
      this.data = JSON.stringify(option.data);
    }
    
    $.ajax({
      type: self.queryType,
      url: _selfUrl,
      async: self.async,
      contentType: "application/json ; charset=utf-8",
      dataType: "json",
      data: self.data,
      success: function (data) {
        self.json = data;
        self.callback(data);
      },
      error: function (err) {
        console.log(err);
        self.errorCallback(err);
      }
    });
    return self.json;
  } catch (e) {
    console.log(e);
  }
};

mcMethod.query.request.prototype.getCommonUrlParam = function (option) {
  this.companyId = option.companyId || mcMethod.info.companyId;
  this.appCode = option.appCode || mcMethod.info.appCode;
  this.userId = option.userId || mcMethod.info.userId;
  this.serviceCode = option.serviceCode || mcMethod.info.serviceCode;
  this.versionId = option.versionId || mcMethod.info.versionId;
  this.token = option.token || "";
  this.timeStamp = option.timeStamp || "";
  this.address = option.address || "";
  var serviceCodes = "";
  var queryString = "";
  var address = "";
  
  if (this.appId != "") {
    appId = "&appId=" + this.appId;
  }
  
  if (this.serviceCode != "") {
    serviceCodes = "&serviceCode=" + this.serviceCode;
  }
  if (this.address != "") {
    var addressObj = this.address;
    for (var item in addressObj) {
      address += "&" + item + "=" + addressObj[item];
    }
  }
  if (option.data !== "" && option.data !== undefined && option.data !== null && typeof option.data == "object") {
    for (var dataKey in option.data) {
      queryString += "&" + dataKey + "=" + option.data[dataKey];
    }
  } else {
    // console.log("请查看传入的参数是否正确，是否为对象形式!");
  }
  return "?companyId=" + this.companyId +
    "&userId=" + this.userId +
    "&appCode=" + this.appCode +
    "&versionId=" + this.versionId +
    serviceCodes +
    queryString +
    address
  
};
