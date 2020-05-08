let auth2 = {};



function signOut() {
    if(auth2.signOut) auth2.signOut();
    if(auth2.disconnect) auth2.disconnect();

}


function userChanged(user){
    document.getElementById("userName").innerHTML = user.getBasicProfile().getName();
    updateSignIn();

}

var updateSignIn = function() {           //ukaz a hide google sing in + mena

    const sgnd = auth2.isSignedIn && auth2.isSignedIn.get();
    if (sgnd) {
        document.getElementById("SignInButton").classList.add("hiddenElm");
        document.getElementById("SignedIn").classList.remove("hiddenElm");
        document.getElementById("userName").innerHTML=auth2.currentUser.get().getBasicProfile().getName();
    }else{
        document.getElementById("SignInButton").classList.remove("hiddenElm");
        document.getElementById("SignedIn").classList.add("hiddenElm");
    }

    let autor1 = document.getElementById("authorm");

    let autor3 = document.getElementById("authors");
    let autor4 = document.getElementById("name");

    if (sgnd) {
        const user =auth2.currentUser.get();
        if (autor1) {
            autor1.value = user.getBasicProfile().getName();
        }
        if (autor3) {
            autor3.value = user.getBasicProfile().getName();
        }
        if (autor4) {
            autor4.value = user.getBasicProfile().getName();
        }


    } else {
        if (autor1) {
            autor1.value = "";

        }

        if (autor3) {
            autor3.value = "";

        }
        if (autor4) {
            autor4.value = "";

        }
    }

    // var userNameInputElm = document.getElementById("authors");
    // if (userNameInputElm){// pre 82GoogleAccessBetterAddArt.html
    //     userNameInputElm.value=user.getBasicProfile().getName();
    // }

}

function startGSingIn() {  //google sing in button
    gapi.load('auth2', function() {
        gapi.signin2.render('SignInButton', {
            'width': 240,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });
        gapi.auth2.init().then( //zavolat po inicializácii OAuth 2.0  (called after OAuth 2.0 initialisation)
            function (){

                auth2 = gapi.auth2.getAuthInstance();
                auth2.currentUser.listen(userChanged);
                auth2.isSignedIn.listen(updateSignIn);
                auth2.then(updateSignIn); //tiez po inicializacii (later after initialisation)
            });
    });

}

function onSuccess(googleUser) {
    // console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}
function onFailure(error) {
    // console.log(error);
}