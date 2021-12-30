const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

//CONSIDER AS DB
let user = {
    id: "12341234",
    email: "osama@gmail.com",
    password: 'qwerqwer'
}

const SECRET = "SECRET TING YA GET MEH" //In production, secret tokens are stored in a .env file to keep them secure

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.send("Hello Boys");
})

app.get("/forgot-password", (req, res, next) => {
    res.render('forgot-password')
})
app.post("/forgot-password", (req, res, next) => {
    const email = req.body.email;

    //make sure user exists in DB
    if(email !== user.email){ // this is an example, in an actual app you need to search for the user in DB and check existence
        res.send('user not registered')
        return;
    }

    // user exists, now create one time link that is valid for 15 minutes
    const secret = SECRET + user.password;
    const payload = {
        email: user.email,
        id: user.id
    }
    const token = jwt.sign(payload, secret, {expiresIn: '15m'});
    const link = `http://localhost:3000/reset-password/${user.id}/${token}`;

     // In production, the reset link is sent to user as email here
    console.log(link);

    res.send('Password reset link has been sent to your email . .');
})

app.get("/reset-password/:id/:token", (req, res, next) => {
    const {id ,token} = req.params;
    
    //check if this id exists in DB
    if(id !== user.id){
        res.send("Invalid ID");
        return;
    }

    const secret = SECRET + user.password;
    try{
        const payload = jwt.verify(token, secret);
        //if verified render reset password page
        res.render('reset-password', {email: user.email})
    }catch(err){
        console.log(err.message);
        res.send(err.message);
    }
})
app.post("/reset-password/:id/:token", (req, res, next) => {
    const { id, token } = req.params;
    const { password, conf_password} = req.body;
    //check if this id exists in DB
    if (id !== user.id) {
        res.send("Invalid ID");
        return;
    }

    const secret = SECRET + user.password;
    try {
        const payload = jwt.verify(token, secret);

        //if verified reset password in DB

        if(password !== conf_password){
            res.send("Passwords don't match, try again.")
            return;
        }

        // now we can find user using email and id in payload then reset user password in DB
        user.password = password; //In production, hash then update password in DB
        res.send(user)
    } catch (err) {
        console.log(err.message);
        res.send(err.message);
    }
})

app.listen(3000, () => {
    console.log("Listening on port 3000");
})