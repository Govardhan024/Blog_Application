const express = require("express");
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const UserModel = require('./models/user');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const multer = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const Post = require('./models/post')

const secret = "kkjdjnjnkjnvkjnnjsjjjsk";


app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads' , express.static(__dirname+'/uploads'));

main().then(() => {
  console.log("connected to dbs");
})

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Blogapp");
}

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await UserModel.create({
    username,
    password: bcrypt.hashSync(password, salt)
  })
  res.json(userDoc);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await UserModel.findOne({ username });
  if (!userDoc) {
    return res.status(400).json("User not found");
  }

  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id:userDoc._id,
        username,
      });  // Set the cookie here
    });
  } else {
    res.status(400).json("Wrong username or password");
  }
});


app.get('/profile', (req, res) => {
  const { token } = req.cookies;

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.json(info);
  });
});


app.post('/logout', (req, res) => {

  res.cookie('token', '').json('ok');

});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async(err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author:info.id,
})

    res.json(postDoc);
  });
  
})

app.get('/post', async (req, res) => {
  const posts = await Post.find().populate('author',['username']);
  res.json(posts);
})

app.get('/post/:id',async(req,res)=>{
  const {id}=req.params;
  const postDoc=await Post.findById(id).populate('author',['username']);
  res.json(postDoc);
})


app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;

  try {
    if (req.file) {
      const { originalname, path } = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path + '.' + ext;
      fs.renameSync(path, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) {
        return res.status(500).json({ error: 'Error verifying token' });
      }

      try {
        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);

        if (!postDoc) {
          return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the user is the author of the post
        if (postDoc.author.toString() !== info.id) {
          return res.status(403).json({ error: 'You are not the author of this post' });
        }

        // Update the post using findByIdAndUpdate
        const updatedPost = await Post.findByIdAndUpdate(
          id,
          {
            title,
            summary,
            content,
            cover: newPath || postDoc.cover,
          },
          { new: true } // Return the updated document
        );

        res.json(updatedPost);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating post' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing file upload' });
  }
});


app.listen(4000);
