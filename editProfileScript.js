$(function(){
    load();
})

export function load(){
    generateEditProfileForm();
    $(document).on('click', '#logout', function(){handleLogOut(this)});
}

export function generateEditProfileForm(){
    auth.onAuthStateChanged(function(user){
        let userData = db.collection("users").doc(user.uid);
        userData.get().then((doc) =>{
            let form = `<div id ="form" class="card">
                                <h1>Edit Profile</h1>
                                <form class="form" id="editForm">
                                    <label class="label">Change E-Mail</label>
                                    <input class="input" type="text" name="signup-email" placeholder=${doc.data().email}>
                                    <label class="label">Change Username</label>
                                    <input class="input" type="text" name="username" placeholder=${doc.data().username}>
                                    <label class="label">Change Password</label>
                                    <input class="input" type="text" name="signup-password" placeholder="Type New Password">
                                    <input class="input" type="checkbox" id="color" name="color" value="color" checked>
                                    <label for="color">Dark Mode</label>
                                    <button id="signUp" type="submit">Submit</button>
                                </form>
                        </div>`
            document.getElementById("profileForm").innerHTML = form;
        });
    });
}

export function handleLogOut(event){
    auth.signOut()
    .then(()=>{
        window.location.href = 'index.html';
    });
}