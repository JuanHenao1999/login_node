const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const dontenv = require("dotenv");
dontenv.config({ path: "./env/.env" });

app.use("/resource", express.static("public"));
app.use("/resource", express.static(__dirname + "/public"));

app.set("view engine", "ejs");

const bcryptjs = require("bcryptjs");

const session = require("express-session");
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// conexion DB
const connection = require("./database/db.js");

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const user = req.body.user;
  const name = req.body.name;
  const rol = req.body.rol;
  const pass = req.body.pass;
  const passwordHaash = await bcryptjs.hash(pass, 8);
  connection.query(
    "INSERT INTO users SET ?",
    { user: user, name: name, rol: rol, pass: passwordHaash },
    async (error, result) => {
      if (error) {
        console.log(error);
      } else {
        res.render("register", {
          alert: true,
          alertTitle: "Registration",
          alertMessage: "¡Successful Registration!",
          alertIcon: "success",
          showConfirmButton: false,
          timer: 1500,
          ruta: "",
        });
      }
    }
  );
});

app.post("/auth", async (req, res) => {
  const user = req.body.user;
  const pass = req.body.pass;
  const passwordHaash = await bcryptjs.hash(pass, 8);
  if (user && pass) {
    connection.query(
      "SELECT * FROM users WHERE user = ?",
      [user],
      async (error, results) => {
        if (
          results.length == 0 ||
          !(await bcryptjs.compare(pass, results[0].pass))
        ) {
          res.render("login", {
            alert: true,
            alertTitle: "Error",
            alertMessage: "USUARIO y/o PASSWORD incorrectas",
            alertIcon: "error",
            showConfirmButton: true,
            timer: false,
            ruta: "login",
          });
        } else {
          req.session.loggedin = true;  
          req.session.name = results[0].name;
          res.render("login", {
            alert: true,
            alertTitle: "Conexion exitosa",
            alertMessage: "¡LOGIN CORRECTO!",
            alertIcon: "success",
            showConfirmButton: false,
            timer: 1500,
            ruta: "",
          });
        }
      }
    );
  } else {
    res.render("login", {
      alert: true,
      alertTitle: "Advertencia",
      alertMessage: "¡Por favor ingrese un usuario y/o password!",
      alertIcon: "warning",
      showConfirmButton: true,
      timer: false,
      ruta: "login",
    });
  }
});

// Auth pages
app.get('/', (req, res ) => {
    if (req.session.loggedin) {
        res.render('index', {
            login:true,
            name: req.session.name
        })
    }else {
        res.render('index', {
            login: false,
            name: 'Debe iniciar sesión'
        })
    }
})

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

app.listen(3000, (req, res) => {
  console.log("Server running in http://localhost:3000");
});
