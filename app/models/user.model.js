const sql = require("./db.js");
const jwt = require("jsonwebtoken");
const scKey = require("../config/jwt.config.js");
const bcrypt = require("bcryptjs");
const expireTme = "2h";
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

User.create = (newUser, result)=>{
    sql.query("INSERT INTO users SET ?", newUser , (err, res)=>{
        if(err){
            console.log("Querry error: ", err);
            result(err, null);
            return;
        }
        const token = jwt.sign({id: res.insertId}, scKey.secret, {expiresIn: expireTme});
        console.log("created user: ", {id: res.insertId, ...newUser, accessToken: token});
        result(null, {id: res.insertId, ...newUser, accessToken: token});
    });
};

User.loginModel = (account, result)=>{
    console.log(account.username);
    sql.query("SELECT * FROM users WHERE username = ?", [account.username], (err, res)=>{
        if(err){
            console.log("Querry error: ", err);
            result(err, null);
            return;
        }
        if(res.length){
            const validPassword = bcrypt.compareSync(account.password, res[0].password);
            if(validPassword){
                const token = jwt.sign({id: res.insertId}, scKey.secret, {expiresIn: expireTme});
                console.log("Login sucess. Token: ", token);
                res[0].accessToken = token;
                result(null, res[0]);
            } else {
                console.log("Password invalid: ", res[0]);
                result({kind: "invalid_password"}, null);
            }
            return;
        }
        result({kind: "not_found"}, null);
    }
)};

User.getAllRecords = (result) => {
    sql.query("SELECT * FROM users", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }
        console.log("users: ", res);
        result(null, res);
    });
};

const removeOldImage = (id, result) => {
    sql.query("SELECT img FROM users WHERE id = ?", id, (err, res)=>{
        if(err){
            console.log("error: ", err);
            result(null, err);
            return;
        }
        if(res.length){
            let filePath = __basedir + "/assets/uploads/" + res[0].img;
            try {
                if(fs.existsSync(filePath)){
                    fs.unlinkSync(filePath, (err)=>{
                        if(e){
                            console.log("error: ", e);
                            return;
                        }else{
                            console.log("File: ", res[0].img, " removed.");
                            return;
                        }
                    });
                } else {
                    console.log("File: " + res[0].img + " not found.");
                    return;
                }
            } catch (error) {
                console.error(error);
                return;
            }
            result(null, res[0].img);
        } else {
            result({kind: "not_found"}, null);
        }
    });
};

User.updateUser = (id, data, result) => {
    removeOldImage(id);
    sql.query("UPDATE users SET fullname=?, email=?, img=? WHERE id = ?", [data.fullname, data.email, data.img, id], (err, res)=>{
        if(err){
            console.log("error: ", err);
            result(null, err);
            return;
        }
        if(res.affectedRows == 0){
            result({kind: "not_found"}, null);
            return;
        }
        console.log("updated user: ", {id: id, ...data});
        result(null, {id: id, ...data});
        return;
    });
}

User.deleteUser = (id, result) => {
    removeOldImage(id);
    sql.query("DELETE FROM users WHERE id = ?", id, (err, res)=>{
        if(err){
            console.log("error: ", err);
            result(null, err);
            return;
        }
        if(res.affectedRows == 0){
            result({kind: "not_found"}, null);
            return;
        }
        console.log("deleted user: ", id);
        result(null, res);
    });
};

module.exports = User;
