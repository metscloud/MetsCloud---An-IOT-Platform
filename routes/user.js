var express = require("express");
const { response } = require("../app");
var router = express.Router();
var objectId = require("mongodb").ObjectID;
const { ObjectID } = require("bson");
var userHelpers = require("../helpers/user-helpers");
var subscribe = require("../mqtt-clients/subscribe");
var publish = require("../mqtt-clients/publish");
var sensorDataUart = require("../static-data/sensorData-uart");
var sensorDataProgrammingMode = require("../static-data/sensorData-programmingMode");
const socket = require("socket.io");
const async = require("hbs/lib/async");
const notificationPusher = require("../helpers/notificationPusher");
const ad = require("../test");
const iiotUserHelpers = require("../helpers/iiot-user-helpers");
const collections = require("../config/collections");
var path = require("path");
const mongodb = require("mongodb");
const binary = mongodb.Binary;

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    console.warn("User already logged in");
    next();
  } else {
    res.render("login");
  }
};
router.get("/catching", (req, res) => {
  res.render("catching");
});
router.post("/generatekey", (req, res) => {
  userHelpers.keyGenaratorCatching().then((response) => {
    res.redirect(req.get("referer"));
  });
});

/* GET home page. */
router.get("/", function (req, res, next) {
  ad.sendNotification();

  // var io = req.io;

  // io.emit('fromServer', 'reloaded');

  res.render("index", { admin: false });
  // res.download(path.resolve('./README.md'))
});
// router.get('/:id', (req, res)=> {
//   console.log(req.params.id);
//   userHelpers.checkCachingData(req.params.id).then((response)=>{
//     console.log('CATCH ID FOUNDED');
//     console.log(response);
//     res.json(response);
//   })

// });
router.get("/signup", function (req, res, next) {
  res.render("signup", { admin: false });
});
router.post("/signup", (req, res) => {
  console.log(req.body);
  userHelpers.keyValidator(req.body.key).then((status) => {
    if (status.status) {
      console.log("KEY  FOUND IN DB ###");
      userHelpers.doSignup(req.body).then((obj) => {
        userHelpers.keyDeleter(req.body.key);
        console.log("key deleted");
        console.log(obj);
        notificationPusher.sentEmail(
          req.body.email,
          "Welcome to Mets Cloud",
          "Thank you for signing up...Have a nice experience"
        );

        res.redirect("/");
      });
    } else {
      console.log("#################### NO KEY FOUND  #############");
      res.redirect("/");
    }
  });
});
router.get("/login", (req, res) => {
  userHelpers.getAllSecKeys();
  res.render("login", { admin: false });
});
router.post("/login", async (req, res) => {
  console.log("submitting login page requestes...");
  console.log(req.body);

  userHelpers.doLogin(req.body).then(async (response) => {
    let uartStatus = false;
    let dataUart;
    let option1;
    let option2;
    let option3;
    let option4;
    let option5;

    //status checker
    if (response.status) {
      // req.session.loggedIn=true
      req.session.user = response.user;
      let firstConnect = false;
      if (response.user.firstConnect === true) {
        firstConnect = true;
      } else {
        firstConnect = false;
      }

      console.log("++++++++++++++++++++++++++++++++==========>>>>>");
      console.log(response.user);
      let data = {
        email: response.user.email,
        dtopic: response.user.defaultTopic,
        liveMode: response.user.liveMode,
        deviceNames: response.user.deviceNames,
        deviceId: response.user.primary_key,
      };
      console.log(data);

      if (response.user.liveMode === "uart") {
        uartStatus = true;
        console.log(uartStatus);
        console.log(req.session.user._id);
        let a = req.session.user._id;
        await userHelpers
          .getDevices(req.session.user._id)
          .then(async (devices) => {
            console.log("=============>" + devices);
            await userHelpers
              .getUartSubscribtions(objectId(a).toString(), devices)
              .then((response) => {
                if (response) {
                  console.log(">>>>>>");
                  console.log(response);
                  dataUart = response[0];
                  console.log(dataUart);
                } else {
                  console.log("Failed to fetch data");
                }
              });
          });
      } else {
        option1 = await userHelpers.settingPinToOptions("1");
        option2 = await userHelpers.settingPinToOptions("2");
        option3 = await userHelpers.settingPinToOptions("3");
        option4 = await userHelpers.settingPinToOptions("4");
        option5 = await userHelpers.settingPinToOptions("5");
      }
      console.log(data);

      res.render("account", {
        data,
        firstConnect,
        uartStatus,
        dataUart,
        option1,
        option2,
        option3,
        option4,
        option5,
      });
      var io = req.io;
      console.log(socket.id);
    } else {
      req.session.loginErr = "Invalied Username or Password";
      res.redirect("/");
    }
  });
});
router.get("/connect/:id", (req, res) => {
  userHelpers
    .connecter("dt", req.params.id, req.session.user._id)
    .then((res) => {
      console.log(res);

      // userHelpers.pickSecondaryKey(req.params.id).then((secKey)=>{
      publish.publishSecondaryKeyToDevice(
        req.params.id,
        res.secondary_key_publish
      );

      // })
    });
});

router.get("/uart", (req, res) => {
  userHelpers.getDevices(req.session.user._id).then((devices) => {
    console.log(devices);

    userHelpers
      .getUartSubscribtions(req.session.user._id, devices)
      .then((response) => {
        if (response) {
          let data = response.uartMode;
          res.render("uart", { data });
        } else {
          res.render("uart");
        }
      });
  });
});

router.get("/add-device", (req, res) => {
  res.render("add-device");
});
router.post("/add-device", (req, res) => {
  console.log(req.body);
  userHelpers.keyValidator(req.body.serialNo).then(async (status) => {
    if (status.status) {
      await userHelpers
        .deviceUpdater(req.session.user._id, req.body)
        .then((res) => {});
    } else {
      console.log("no such device");
    }
  });
});

router.post("/uart-submit", async (req, res) => {
  let urtParameter = req.body;
  await userHelpers.uartAndProgrammingModeStore(
    req.session.user._id,
    urtParameter,
    urtParameter.device
  );
  publish.publishCountToDevice(req.session.user._id).then((status) => {
    res.redirect("/uart");
  });
});
router.get("/uart-delete-parameter/:id/:deviceId", async (req, res) => {
  console.log(req.params.id);
  await userHelpers.deleteUartParameter(
    req.session.user._id,
    req.params.id,
    req.params.deviceId
  );
  publish
    .publishCountToDevice(req.session.user._id, req.params.deviceId)
    .then((status) => {
      res.redirect("/uart");
    });
});
router.get("/uart-view-parameter/:id/:deviceId", (req, res) => {
  console.log(req.params.id);
  console.log(req.params.deviceId);
  userHelpers
    .getValues(req.session.user._id, req.params.id, req.params.deviceId)
    .then((response) => {
      console.log(response);
      if (response) {
        let data = response;
        let type = "line";
        res.render("view-parameter", { data, type });
      } else {
        res.render("view-parameter");
      }
    });
});

router.get("/selected-uart", (req, res) => {
  userHelpers.liveModeChanger(req.session.user._id, "uart").then((data) => {
    if (data.status) {
      res.redirect(req.get("referer"));
    } else {
      console.log("failed to update the live mode");
    }
  });
});

router.get("/selected-programming", (req, res) => {
  userHelpers
    .liveModeChanger(req.session.user._id, "pro")
    .then(async (data) => {
      if (data.status) {
        res.redirect(req.get("referer"));
      } else {
        console.log("failed to update the live mode");
      }
    });
});
router.get("/programmingmode", async (req, res) => {
  let option1 = await userHelpers.settingPinToOptions("1");
  let option2 = await userHelpers.settingPinToOptions("2");
  let option3 = await userHelpers.settingPinToOptions("3");
  let option4 = await userHelpers.settingPinToOptions("4");
  let option5 = await userHelpers.settingPinToOptions("5");
  res.render("pro", { option1, option2, option3, option4, option5 });
});
router.post("/pro-submit", async (req, res) => {
  console.log(req.body);
  let data = req.body;
  arrayData = [];
  console.log(typeof data.parameter1);

  if (data.parameter1 != "none") {
    await userHelpers.keyTaker(data.parameter1).then((response) => {
      console.log(response);
      arrayData.push(response.key);
    });
  } else {
    let pin = "0";
    arrayData.push(pin);
  }

  if (data.parameter2 != "none") {
    await userHelpers.keyTaker(data.parameter2).then((response) => {
      console.log(response);
      arrayData.push(response.key);
    });
  } else {
    let pin = "0";
    arrayData.push(pin);
  }
  if (data.parameter3 != "none") {
    await userHelpers.keyTaker(data.parameter3).then((response) => {
      console.log(response);
      arrayData.push(response.key);
    });
  } else {
    let pin = "0";
    arrayData.push(pin);
  }
  if (data.parameter4 != "none") {
    await userHelpers.keyTaker(data.parameter4).then((response) => {
      console.log(response);
      arrayData.push(response.key);
    });
  } else {
    let pin = "0";
    arrayData.push(pin);
  }

  if (data.parameter5 != "none") {
    await userHelpers.keyTaker(data.parameter5).then((response) => {
      console.log(response);
      arrayData.push(response.key);
    });
  } else {
    let pin = "0";
    arrayData.push(pin);
  }
  console.log(arrayData);
  userHelpers
    .secondaryKeyTaker(req.params.deviceId, req.session.user._id)
    .then((secKey) => {
      console.log(secKey);
      let pin1 = false;
      let led1 = false;
      let pin2 = false;
      let led2 = false;
      let pin3 = false;
      let led3 = false;
      let pin4 = false;
      let led4 = false;
      let pin5 = false;
      let led5 = false;
      let pwm2 = false;
      let pwm3 = false;
      let pwm4 = false;
      let pwm5 = false;

      if (data.parameter2 != "none") {
        pin2 = true;
        if (data.parameter2 == "led") {
          led2 = true;
        }
        if (data.parameter2 == "pwm") {
          pwm2 = true;
        }
      }
      if (data.parameter3 != "none") {
        pin3 = true;
        if (data.parameter3 == "led") {
          led3 = true;
        }
        if (data.parameter3 == "pwm") {
          pwm3 = true;
        }
      }
      if (data.parameter4 != "none") {
        pin4 = true;
        if (data.parameter4 == "led") {
          led4 = true;
        }
        if (data.parameter4 == "pwm") {
          pwm4 = true;
        }
      }
      if (data.parameter5 != "none") {
        pin5 = true;
        if (data.parameter5 == "led") {
          led5 = true;
        }
        if (data.parameter5 == "pwm") {
          pwm5 = true;
        }
      }
      publish.publishPinValuesToDevice(secKey, arrayData).then((status) => {
        res.render("pro-spec", {
          pin1,
          pin2,
          pin3,
          pin4,
          pin5,
          led1,
          led2,
          led3,
          led4,
          led5,
          pwm2,
          pwm3,
          pwm4,
          pwm5,
          arrayData,
        });
      });
    });
});

router.post("/calculation-submit", (req, res) => {
  console.log(req.body);

  // here the status is to indicate the led is on/off
  let status2 = false;
  let status3 = false;
  let status4 = false;
  let status5 = false;
  let dataForPublishToDevice = ["0"];
  let pwmData = ["0"];

  // PIN 2
  if (req.body.onOrOff2) {
    if (req.body.onOrOff2 == "ON") {
      status2 = true;
    }
    let d = userHelpers.proModeDataMaker(
      status2,
      req.body.onDuration2,
      req.body.offDuration2
    );
    dataForPublishToDevice.push(d);
    console.log(dataForPublishToDevice);
  } else {
    dataForPublishToDevice.push("0");
  }
  if (req.body.timePeriod2) {
    let data = userHelpers.proPwmDataMaker(
      req.body.timePeriod2,
      req.body.dutyCycle2
    );
    pwmData.push(data);
  } else {
    pwmData.push("0");
  }

  // PIN 3
  if (req.body.onOrOff3) {
    if (req.body.onOrOff3 == "ON") {
      status3 = true;
    }
    let d = userHelpers.proModeDataMaker(
      status3,
      req.body.onDuration3,
      req.body.offDuration3
    );
    dataForPublishToDevice.push(d);
    console.log(dataForPublishToDevice);
  } else {
    dataForPublishToDevice.push("0");
  }
  if (req.body.timePeriod3) {
    let data = userHelpers.proPwmDataMaker(
      req.body.timePeriod3,
      req.body.dutyCycle3
    );
    pwmData.push(data);
  } else {
    pwmData.push("0");
  }

  // PIN 4
  if (req.body.onOrOff4) {
    if (req.body.onOrOff4 == "ON") {
      status4 = true;
    }
    let d = userHelpers.proModeDataMaker(
      status4,
      req.body.onDuration4,
      req.body.offDuration4
    );
    dataForPublishToDevice.push(d);
    console.log(dataForPublishToDevice);
  } else {
    dataForPublishToDevice.push("0");
  }
  if (req.body.timePeriod4) {
    let data = userHelpers.proPwmDataMaker(
      req.body.timePeriod4,
      req.body.dutyCycle4
    );
    pwmData.push(data);
  } else {
    pwmData.push("0");
  }

  // PIN 5
  if (req.body.onOrOff5) {
    if (req.body.onOrOff5 == "ON") {
      status5 = true;
    }
    let d = userHelpers.proModeDataMaker(
      status5,
      req.body.onDuration5,
      req.body.offDuration5
    );
    dataForPublishToDevice.push(d);
    console.log(dataForPublishToDevice);
  } else {
    dataForPublishToDevice.push("0");
  }
  if (req.body.timePeriod5) {
    let data = userHelpers.proPwmDataMaker(
      req.body.timePeriod5,
      req.body.dutyCycle5
    );
    pwmData.push(data);
  } else {
    pwmData.push("0");
  }
  console.log(req.body.keys);
  console.log(dataForPublishToDevice);
  console.log(pwmData);
  let fin = req.body.keys;
  let finData = fin.split(",");
  for (let i = 0; i <= 4; i++) {
    if (finData[i] == "led") {
      finData[i] = dataForPublishToDevice[i];
      console.log(dataForPublishToDevice[i]);
    }
    if (finData[i] == "pwm") {
      finData[i] = pwmData[i];
    }
  }
  console.log("FINALLLLLLLLL");
  console.log(finData);
  console.log(JSON.stringify(finData));

  publish
    .publishProModeDataLedToDevice(req.session.user._id, finData)
    .then((status) => {
      console.log("DOne");
    });
});

///////////////            I       I       O      T          /////////////
///////////////            I       I       O      T          /////////////
///////////////            I       I       O      T          /////////////
///////////////            I       I       O      T          /////////////
///////////////            I       I       O      T          /////////////
///////////////            I       I       O      T          /////////////
///////////////            I       I       O      T          /////////////
///////////////            I       I       O      T          /////////////
///////////////            I       I       O      T          /////////////
///////////////            I       I       O      T          /////////////
///////////////            I       I       O      T          /////////////
///////////////            I       I       O      T          /////////////

// check the get and post methods in iiot page.For tesing purpose it is made as get. [ACTUALLY IT IS POST CHANGE IT ]

router.get("/iiotBusinessSignup", (req, res) => {
  iiotUserHelpers.signUpBusinessOwner();
});

router.post("/create-token", (req, res) => {
  console.log(req.query.userid);
  console.log(req.query.designation);
  console.log(req.body);
  iiotUserHelpers.createToken(
    req.query.designation,
    req.body.email,
    req.query.userid,
    req.body.designation
  ).then((res)=>{
     notificationPusher.sentEmail(req.body.email,"Invite to Join Mets Cloud",`Public ID :${res.publicId}  TokenID : ${res.tokenID}`)
  })
});
//////////
router.post("/iiot-signin", async (req, res) => {
  console.log(req.body);
  let des = req.body.designation;
  await iiotUserHelpers
    .doLogin(req.body, req.body.designation)
    .then((response) => {
      if (response.status) {
        res.json({ isLoggedIn: true, id: response.user._id, des });
      } else {
        res.json({ isLoggedIn: false });
      }
    });
});

router.post("/iiotAdd-employee", async (req, res) => {
  console.log(req.body);
  let isSignedUp = false;
  if (req.body.designation == "projectManager") 
  {
    isSignedUp = await iiotUserHelpers.addNewEmployee(
      "businessOwner",
      "projectManager",
      req.body
    );
    console.log("Checked with bo and pm::  "+isSignedUp);
 
  } else if (req.body.designation == "supervisor") {
   if(isSignedUp==false)
   {
    isSignedUp = await iiotUserHelpers.addNewEmployee(
      "businessOwner",
      "supervisor",
      req.body
    );
   }
    
    console.log("Checked with bo and su ::  "+isSignedUp);
    if ((isSignedUp == false)) {
      isSignedUp = await iiotUserHelpers.addNewEmployee(
        "projectManager",
        "supervisor",
        req.body
      );
    }

    console.log("Checked with pm and su ::  "+isSignedUp);
  }

  res.json({ isSignedUp });
});
router.post("/iiot-userconfig", (req, res) => {
  console.log(req.body);
  let data;
  console.log(req.query.userid);
  console.log(req.query.designation);
  iiotUserHelpers
    .dashboardData(req.query.userid, req.query.designation)
    .then((data) => {
      res.json(data);
    });
});

router.post("/iiot-view-projectManagers", (req, res) => {
  console.log(req.query.userid);
  iiotUserHelpers.viewProjectManagers(req.query.userid).then((data) => {
    let finalData = [];
    iiotUserHelpers.dataOfProjectManagers(data).then((data2) => {
      console.log("))");
      console.log(data2);
      for (let i = 0; i < data2.length; i++) {
        let d = {
          img: 4,
          id: data2[i]._id.toString(),
          name: data2[i].nameOfProjectManager,
          email: data2[i].email,
          status: "Offline",
        };
        finalData.push(d);
      }
      console.log(finalData);
      res.json(finalData);
    });
  });
  
});

router.post("/iiot-view-superVisor", (req, res) => {
  let da=[]
  console.log(req.query.designation);
  console.log(req.query.userid);
  iiotUserHelpers.viewSupervisors(req.query.userid,req.query.designation).then((data)=>{
    console.log(data);
      iiotUserHelpers.dataOfSupervisors(data,'supervisor').then((data2)=>{
        console.log(data2);
        for (let i = 0; i < data2.length; i++) {
          let d = {
            img: 4,
            id: data2[i]._id.toString(),
            name: data2[i].nameOfSupervisor,
            email: data2[i].email,
            status: "Offline",
          };
          da.push(d)
        }
        res.json(da)
      })
    })
  console.log(req.body);
})
///////
router.post("/iiot-add-device", (req, res) => {
  console.log(req.query.designation);
  console.log(req.query.userid);
  console.log(req.body);
  iiotUserHelpers.addDevice(req.query.userid, req.query.designation,req.body).then((data)=>{
    res.json({status:data.status})//error
  })

});

router.post("/iiot-show-devices", (req, res) => {
  iiotUserHelpers
    .deviceData(req.query.userid, req.query.designation)
    .then((data) => {
      console.log(data.deviceNames,data.deviceIds);
      res.json({deviceNames:data.deviceNames,deviceIds:data.deviceIds})
      
    });
});
router.post("/iiot-add-sensor", (req, res) => {
  console.log(req.query.designation);
  console.log(req.query.userid);
  console.log(req.body);
  iiotUserHelpers.addSensor(
    req.query.userid,
    req.body.deviceid,
    req.query.designation,
    10,
    collections.CART_COLLECTION,
    req.body
  );
});
router.get("/iiot-share-chart", (req, res) => {
  iiotUserHelpers.shareChart(
    "bZ6CUEFF",
    "asdd",
    "supervisor",
    "62c0458ba848c5290546da52"
  );
});

router.get("/iiot-shared-charts-load", (req, res) => {
  iiotUserHelpers.loadDataFromSharedChart(
    "62e491c6132392207cc00d3b",
    "businessOwner"
  );
});
router.post("/iiot-chart-ids", (req, res) => {// pass device id tooo as a n array of a objects
console.log("))))))");
  console.log(req.query.id);
  console.log(req.query.designation);

   iiotUserHelpers.chartIds(req.query.id,req.query.designation,'device').then((data)=>{
    // console.log(data);
    res.json({ids:data})
   })
  // res.json({
  //   ids: ["aaal"],
  // });
});
router.post("/iiot-chart-data", (req, res) => {// get device id tooo
 
  console.log(req.query.id);
  console.log(req.query.designation);
  console.log(req.query.userid);
  iiotUserHelpers.chartData(req.query.userid,req.query.id).then((data)=>{
  
   console.log(data.values);
  let chartValues=data.values.map(({value}) => value)
  let chartDates=data.values.map(({date}) => date)
  
    res.json({
      id: data.Id,
      name: data.nickname,
      chartdata: {
        dataArray: [
          {
            name: data.parameter,
            data: chartValues,
          },
        ],
      },
      chartoption: {
        chart: {
          toolbar: {
            show: false,
          },
        },
        tooltip: {
          theme: "white",
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth",
        },
        xaxis: {
          type: "datetime",
          categories:chartDates,
          labels: {
            style: {
              colors: "#c8cfca",
              fontSize: "12px",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: "#c8cfca",
              fontSize: "12px",
            },
          },
        },
        legend: {
          show: false,
        },
        grid: {
          strokeDashArray: 5,
          borderColor: "#56577A",
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "vertical",
            shadeIntensity: 0,
            gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
            inverseColors: true,
            opacityFrom: 0.8,
            opacityTo: 0,
            stops: [],
          },
          colors: ["#2CD9FF", "#582CFF"],
        },
        colors: ["#2CD9FF", "#582CFF"],
      },
    });
  })
  
});

//
router.post("/view-tokens", (req, res) => {
  res.render("uploadTest");
});
router.post("/delete-token", (req, res) => {
  res.render("uploadTest");
});
router.post("/delete-devices", (req, res) => {
  res.render("uploadTest");
});
router.post("/delete-sensor", (req, res) => {
  res.render("uploadTest");
});
router.post("/view-sensor", (req, res) => {
  res.render("uploadTest");
});

router.post('/iiot-chart-alert-submit',(req,res)=>{
  // console.log(req.body);
 console.log(req.body.min);
 console.log(req.body.max);
  // let d={ high: '12,2323,23,23,2,3,23,2,323,2243,2,43', low: '12,23234,23,423,4,23,4,23,4,23,42' }

  //   const high = d.high. split(','). map(high => { return Number(high); }); 
  //   const low = d.low. split(','). map(low => { return Number(low); }); 
  //    console.log(typeof high[1]);
  //    console.log(high[1]);
  //   console.log(high);
  //   console.log(low);
  //   let status=true
  //   for (let index = 0; index < high.length; index++) {
  //    if(isNaN(high[index])===true)
  //    {
  //     console.log("Not in Format");
  //     status=false
  //    }
     

     
      
  //   }
  //   console.log(status);

})

///
router.post('/iiot-download-recent-reports',(req,res)=>{
  res.download('./vv.pdf')
})





////////////////
router.post('/iiot-home-graphs',(req,res)=>{
 
  console.log(req.query.id);
  console.log(req.query.status);
  console.log(req.query.designation);
  console.log(req.query.userid);
  iiotUserHelpers.chartIds(req.query.userid,req.query.designation,'dashboard').then((d)=>{
    console.log(d);
    
    res.json({ids:d})
   })



  
})/////////////
router.post('/iiot-add-to-home',(req,res)=>{

  console.log(req.query.id);

  console.log(req.query.designation);
  console.log(req.query.userid);
  iiotUserHelpers.addToDashboard(req.query.userid,req.query.id,req.query.designation).then((r)=>{
    res.json({status:true})
  })

})



router.post('/iiot-remove-from-home',(req,res)=>{
  console.log(req.body);
  console.log(req.query.userid);
  iiotUserHelpers.removeFromHome(req.query.userid,req.query.id,req.query.designation).then((r)=>{
      res.json({status:true})
    })
})
router.post('/iiot-load-alerts',(req,res)=>{
  console.log(req.body);
  console.log(req.query.userid);
   res.json({min:[12,234,4234,423,42,34,34,23,4234],max:[12,234,4234,423,42,34,34,23,4234]})
})






router.get('/iiot-report-xls',(req,res)=>{

  console.log(req.query.chartId);
  console.log(req.query.designation);
  console.log(req.query.userid);
  res.download('./routes/vv.pdf','',(err)=>{
    if(err)
    {

      console.log(err);
    }
    else{
      console.log("no error");
    }

  })
})
router.get('/iiot-report-pdf',(req,res)=>{
  console.log(req.query.designation);
  console.log(req.query.userid);
  console.log(req.query.chartId);
  res.download('./routes/vv.pdf','',(err)=>{
    if(err)
    {

      console.log(err);
    }
    else{
      console.log("no error");
    }

  })
  // res.attachment('./routes/vv.pdf'').send()
  


})

///

//




router.get("/up", (req, res) => {
  res.render("uploadTest");
});



router.post("/get-devices", (req, res) => {
  console.log(req.query.designation);
  console.log(req.query.userid);
  iiotUserHelpers.getDevices(req.query.userid,req.query.designation).then((data)=>{
    console.log(data);
    res.json(data)
  })
  // res.json({ids:['aaa','bbb','ccc'],
  // name:['aaa','bbb','ccc']})
});
router.post("/get-sensors", (req, res) => {
  console.log(req.query.designation);
  console.log(req.query.userid);
  console.log(req.query.deviceid);
  iiotUserHelpers.getSensors("7544ERSoD8Ci").then((data)=>{
    console.log(data);
    res.json(data)
  })
})
 
// reports from above apis
router.post("/submit-alert", (req, res) => {
console.log(req.body);
  res.json({status:true})
});
router.get("/submit-report", (req, res) => {
  console.log(req.query);
  res.download('./routes/vv.pdf','',(err)=>{
    if(err)
    {

      console.log(err);
    }
    else{
      console.log("no error");
    }

  })
  });
  







router.post("/upload", (req, res) => {
  console.log(req.files.uploadedFile.data);
  let file = { name: req.body.name, file: binary(req.files.uploadedFile.data) };
  iiotUserHelpers.storeReport(file);
});

router.get("/pdfCreate", (req, res) => {
  let date = Date.now();
  let name = date.toString();
  console.log(name);
  // pass date  as the name then function creates the pdf in the name of that and stores it then download using the name
  iiotUserHelpers.createPdf().then((data) => {
    console.log(data);

    res.download(data);
    let file = { name: "report", file: binary(data) };
    iiotUserHelpers.storeReport(file);
  });
});

router.post("/iiot-chart", (req, res) => {
  let d = {
    id: "afsdf",
    name: "TOP NAME",
    chartdata: {
      dataArray: [
        {
          name: "TEMP",
          data: [220, 500, 250, 0, 0, 100, 350, 250, 500, 11, 456, 0],
        },
      ],
    },
    chartoption: {
      chart: {
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        theme: "white",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        type: "datetime",
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        labels: {
          style: {
            colors: "#c8cfca",
            fontSize: "12px",
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#c8cfca",
            fontSize: "12px",
          },
        },
      },
      legend: {
        show: false,
      },
      grid: {
        strokeDashArray: 5,
        borderColor: "#56577A",
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "white",
          type: "vertical",
          shadeIntensity: 0,
          gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
          inverseColors: true,
          opacityFrom: 0.8,
          opacityTo: 0,
          stops: [],
        },
        colors: ["#2CD9FF", "#582CFF"],
      },
      colors: ["#2CD9FF", "#582CFF"],
    },
  };
  let d2 = {
    chartdata: {
      dataArray: [
        {
          name: "sdkjfkjs",
          data: [1, 9, 220, 500, 250, 300, 230, 300, 350, 250, 0, 0],
        },
      ],
    },
    chartoption: {
      chart: {
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        theme: "dark",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        type: "datetime",
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        labels: {
          style: {
            colors: "#c8cfca",
            fontSize: "12px",
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#c8cfca",
            fontSize: "12px",
          },
        },
      },
      legend: {
        show: false,
      },
      grid: {
        strokeDashArray: 5,
        borderColor: "#56577A",
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "vertical",
          shadeIntensity: 0,
          gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
          inverseColors: true,
          opacityFrom: 0.8,
          opacityTo: 0,
          stops: [],
        },
        colors: ["#2CD9FF", "#582CFF"],
      },
      colors: ["#2CD9FF", "#582CFF"],
    },
  };
  res.json([d, d, d2, d]);
});

module.exports = router;
