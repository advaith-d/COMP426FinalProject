$(function(){
    const $loginForm = $('#loginForm');
    const $signupForm = $('#signUpForm')
    
    $loginForm.submit(function(e){
        e.preventDefault();

        const data = $loginForm.serializeArray();
        const email = data[0].value;
        const password = data[1].value;
        
        auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            window.location.href = 'movieRating.html';
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorCode + ': ' + errorMessage);
        });
    });

    $signupForm.submit(function(e){
        e.preventDefault();

        const data = $signupForm.serializeArray();
        const email = data[0].value;
        const password = data[2].value;

        auth.createUserWithEmailAndPassword(email, password).then((userCredential) =>{
            //Signed in
            let user = userCredential.user;

            return db.collection("users").doc(user.uid).set({
                username: data[1].value,
                email: data[0].value,
                id: user.uid,
                liked: [],
                disliked: [],
                notSeen: [],
                dark: true
            });
        }).then(() => {
            window.location.href = 'movieRating.html';
        })
        .catch((error) =>{
            let errorCode = error.code;
            let errorMessage = error.message;
            alert(errorCode + ': ' + errorMessage);
        });
    });
});
