var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    session = require('cookie-session'),
    fs = require('fs');
    var ejs = require('ejs');
    var bodyParser = require('body-parser');
    // parsing the URL-encoded data with the querystring library
    var urlencodedParser = bodyParser.urlencoded({ extended: false });
    var myTodoListJSON = require('./listOfTodoList.json');
    var myAwesTAb = ["Ada", "Java", "JavaScript", "Brainfuck", "LOLCODE", "Node.js", "Ruby on Rails"];

/* controllers */
/* use of session */
app.use(session({secret: 'todotopsecret'}))
//creer un tableau qui contient la liste des taches si il n'est pas deja cree
.use(function(req, res, next){
  req.session.todolList = myTodoListJSON;
    req.session.awesData = myAwesTAb;

  // req.session.Pseudo = Pseudo;
    //appeler  next pour continuer le chainage
    next();
});

/* lister les taches */

app.get('/todolist', function(req, res) {
  res.render('ClientTodoList.ejs', {todolList: req.session.todolList,Pseudo:req.session.Pseudo,awesData:req.session.awesData });
});

/* ajouter une tache */
/*
 * je ne sais pas pourquoi quand on submit le form
 * la valeur de req.body.newTask reste toujours vide
*/
app.post('/todolist/ajouter', urlencodedParser, function(req, res) {

if (req.body.newTask != '') {//verifier si l input est vide,
  //ajouter la tache req.session.todolList au tableau
  //console.log(req.body.newTask);

// on pourra egalement mettre que req.body
}
//renvoyer a ma todolist
res.redirect("/todolist");
});
/* supprimer une tache */
app.get('/todolist/supprimer/:id', function(req, res) {
  // if (req.params.id != '') {//verifier si on est dans le bon url
  // myTodoListJSON.splice(req.params.id,1);
  // }
  //renvoyer a ma todolist
  // res.redirect("/todolist");

})

.get('/todolist/xhr/:index', function(req, res) {
  if (indexOf(myTodoListJSON[req.params.index])!=-1) {
    myTodoListJSON.push({item:myTodoListJSON[req.params.index].item});
    fs.writeFile('./listOfTodoList.json',JSON.stringify(myTodoListJSON,null,2), function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  }

  res.send(JSON.stringify({item:myTodoListJSON[req.params.index].item}));

})

// si la page demande n existe pas
.use(function(req, res, next){
    res.redirect('/todolist');
});
/* end of controllers */

/* socketio */
io.sockets.on('connection', function (socket) {

//Quand un client se connecte, on le note dans la console
    console.log("un client vient de se connecter "+ socket.id);

  //   //stocker les pseudos
  //   // quand on recoit un signal de type pseudo
  //     socket.on('pseudo', function (pseudo) {
  //       var Pseudo;
  //         pseudo = ent.encode(pseudo);
  //         Pseudo = pseudo;
  //         socket.pseudo = pseudo;
  //         socket.broadcast.emit('connected', Pseudo );
   // });

    socket.on('typing',(inputValue)=>{
      socket.broadcast.emit("inputValue",inputValue);
     });
    socket.on('newItemToAdd',(newItem)=>{
      myTodoListJSON.push({"item":newItem});
      if (myAwesTAb.indexOf(newItem)== -1) {
        myAwesTAb.push(newItem);
      }
      socket.broadcast.emit("Gorefresh",newItem);
      fs.writeFile('./listOfTodoList.json',JSON.stringify(myTodoListJSON,null,2), function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
      // fs.writeFile('./listOfTodoList.json',JSON.stringify(myTodoListJSON,null,2), function (err) {
      //   if (err) throw err;
      //   console.log('Saved!');
      // });
    });
//whatever est juste une variable arbitrairement choisie
    socket.on('refresh',(whatever)=>{
      socket.broadcast.emit("Gorefresh",whatever);
    });

    socket.on('refreshOnDelete',(whatever)=>{
      myTodoListJSON.splice(whatever,1);
      fs.writeFile('./listOfTodoList.json',JSON.stringify(myTodoListJSON,null,2), function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
      socket.broadcast.emit("GorefreshOnDelete",whatever);

    });



});
/* end of socket io */

server.listen(8080);
