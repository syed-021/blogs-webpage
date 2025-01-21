import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import pg from "pg";
import { error } from "console";

const __dirname=dirname( fileURLToPath (import.meta.url));

const app=express();
const port=5000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "world",
    password: "csd221005",
    port: 3000,
  });
  db.connect();

  app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/",(req,res)=>{
  res.render("login.ejs");
});

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', async (req, res) => {
    const email = req.body["Email"]
  const  password = req.body["Password"]
  
    // Check if email or password is missing
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Save to database
      const result = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",[email, hashedPassword]);
  
      res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
      
    } catch (error) {
      // Handle duplicate email error
      if (error.codde === '23505') {
        return res.status(400).json({ error: 'Email already exists' });
      }
  
      res.status(500).json({ error: error.message });
    }
  });



// Login endpoint
app.post('/signin', async (req, res) => {
  const email = req.body["Email"]
  const  password = req.body["Password"]

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    //res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  res.render("index.ejs");
});


app.get("/message",(req,res)=>{
    res.render("message.ejs");
});

app.post('/save', async (req, res) => {
  const text = req.body["freeform"]

  // Check if text is missing
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  try {
  
    // Save to database
    const result = await db.query("INSERT INTO Blogs (blog) VALUES ($1) RETURNING *",[text]);

    res.status(201).json({ message: 'Data save successfully', user: result.rows[0] });
    
  } catch (error) {
    // Handle duplicate error
    if (error.codde === '23505') {
      return res.status(400).json({ error: 'text already exists' });
    }

    res.status(500).json({ error: error.message });
  }
});


app.get("/signin",(req,res)=>{
  res.render("index.ejs");
});

app.get("/Fitness",(req,res)=>{
    res.render("Fitness.ejs");
});

app.get("/Business",(req,res)=>{
    res.render("Business.ejs");
});

app.get("/Fashion",(req,res)=>{
    res.render("Fashion.ejs");
});

app.get("/Music",(req,res)=>{
    res.render("Music.ejs");
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  