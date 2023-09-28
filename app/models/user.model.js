
const sql = require("./db.js");
const jwt = require("jsonwebtoken");
const scKey = require("../config/jwt.config.js");
const bcrypt = require("bcryptjs");
const expireTime = "2h";
const fs = require("fs");

const User = {
  create: function (user) {
    this.fullname = user.fullname;
    this.email = user.email;
    this.username = user.username;
    this.password = user.password;
    this.img = user.img;
  },
  checkUsername: function (username, callback) {
    sql.query("SELECT * FROM users WHERE username=?", username, (err, res) => {
      if (err) {
        console.log("Error: " + err);
        callback(err, null);
        return;
      }
      if (res.length) {
        console.log("Found username: " + JSON.stringify(res[0]));
        callback(null, res[0]);
        return;
      }
      callback({ kind: "not_found" }, null);
    });
  },
};

User.create = (newUser, result) => {
    sql.query("Insert INTO users SET ?", newUser, (err, res) => {
      if (err) {
        console.log("Querry error", err);
  
        result(err, null);
  
        return;
      }
  
      const token = jwt.sign({ id: res.insertId }, scKey.secret, {expiresIn: expireTme,});
      result(null, { id: res.insertId, ...newUser, accesToken: token });
      console.log(null, { id: res.insertId, ...newUser, accessToken: token });
    });
  };
  
  User.loginModel = (account, result)=> {
      sql.query("SELECT * FROM users WHERE username=?", [account.username],(err,res)=>{
          if(err){
              console.log("err:", err);
              result(err,null);
              return;
          }
          if(res.length){
              const validPassword = bcrypt.compareSync(account.password, res[0].password);
              if(validPassword){
                  const token = jwt.sign({id:res[0].id}, scKey.secret,{expiresIn: expireTme});
                  console.log("login success. token: ", token);
                  res[0].accessToken = token;
                  result(null,res[0]);
                  return;
              }
              else{
                  console.log("Password not match");
                  result({kind:"invalid_pass"},null);
                  return;
              }
          }
          result({kind:"not_found"}, null);
      });
  };
  
  User.getAllRecords = (result)=>{
      sql.query("SELECT * FROM users", (err,res)=>{
          if(err){
              console.log("Query err: " + err);
              result(err,null);
              return;
          }
          result(null, res)
      });
  };
  
  const removeOldImage = (id, result)=>{
      sql.query("SELECT * FROM users WHERE id=?", id, (err, res)=>{
          if(err){
              console.log("error:" + err);
              result (err,null);
              return;
          }
          if(res.length){
              let filePath = __basedir + "/assets/" + res[0].img;
              try {
                  if(fs.existsSync(filePath)){
                      fs.unlink(filePath, (err)=>{
                          if(e){
                              console.log("Error: " + e);
                              return;
                          }else{
                              console.log("File: " + res[0].img + "not found." )
                              return;
                          }
                      });
                  }
                  else {
                      console.log("file:" + res[0].img +"not found.")
                      return;
                  }
              }
              catch (error) {
                  console.log(error);
                  return;
              }
          }
      })
  };
  User.updateUser = (id, data, result) => {
      removeOldImage(id);
      sql.query(
          "UPDATE users SET fullname=?, email=?, img=? WHERE id=?",
          [data.fullname, data.email, data.img, id], // Added data.img for img placeholder
          (err, res) => {
              if (err) {
                  console.log("Error: " + err);
                  result(err, null);
                  return;
              }
              if (res.affectedRows == 0) {
                  result({ kind: "not_found" }, null);
                  return;
              }
              console.log("Update user: " + { id: id, ...data });
              result(null, { id: id, ...data });
              return;
          }
      );
  };
module.exports = User;