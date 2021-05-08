$(function(){
    load();

    const $reauthentication = $("#reauthenticate");
    $reauthentication.submit(function(e){
        e.preventDefault();

        const data = $reauthentication.serializeArray();
        const password = data[0].value;

        auth.onAuthStateChanged(function(user){
            let credential = firebase.auth.EmailAuthProvider.credential(
                user.email, 
                password
            );

            user.reauthenticateWithCredential(credential)
            .then(function(){
                generateEditProfileForm();
            })
            .catch(function(error){
                document.getElementById("message").innerHTML = `${error.message}`;
            })
        });
    });
});

export function load(){
    $(document).on('click', '#logout', function(){handleLogOut(this)});
    $(document).on('click', '#editProfile', function(){handleEditFormSubmit(this)});
}

export function generateEditProfileForm(){
    auth.onAuthStateChanged(function(user){
        let userData = db.collection("users").doc(user.uid);
        userData.get().then((doc) =>{
            let checked;
            if(doc.data().dark === true){
                checked = 'checked';
            }
            else{
                checked = '';
            }
            let form = `<div id ="form" class="card">
                                <h1>Edit Profile</h1>
                                <form class="form" id="editForm">
                                    <label class="label">Change E-Mail</label>
                                    <input class="input" type="text" name="editEmail" placeholder=${doc.data().email}>
                                    <label class="label">Change Username</label>
                                    <input class="input" type="text" name="editUsername" placeholder=${doc.data().username}>
                                    <label class="label">Change Password</label>
                                    <input class="input" type="text" name="editPassword" placeholder="Type New Password">
                                    <input class="checkboxInput" type="checkbox" id="color" name="color" value="color" ${checked}>
                                    <label for="color">Dark Mode</label>
                                    <button class="button" id="editProfile" type="submit">Save Changes</button>
                                </form>
                                <div id="message"></div>
                        </div>`
            document.getElementById("profileForm").innerHTML = form;
        });
    });
}

export function handleEditFormSubmit(event){
    $('#editForm').submit(function(e){
        e.preventDefault();
    });

    let data = $("#editForm").serializeArray();
    let newEmail = data[0].value;
    let newUsername = data[1].value;
    let newPassword = data[2].value;
    let color = document.querySelector('.checkboxInput').checked;

    auth.onAuthStateChanged(function(user){
        if(newEmail !== ''){
            user.updateEmail(newEmail).then(function(){
                console.log('success');
            }).catch(function(error){
                document.getElementById("message").innerHTML = `${error.message}`;
            })
        }

        if(newUsername !== ''){
            user.updateProfile({
                displayName: newUsername
            })

            db.collection("users").doc(user.uid).update({
                username: newUsername
            });
        }
        
        if(newPassword !== ''){
            user.updatePassword(newPassword).then(function(){
                console.log('success');
            }).catch(function(error){
                document.getElementById("message").innerHTML = `${error.message}`;
            })
        }
        if(color){
            document.body.style.backgroundColor = "rgb(71, 71, 71)";
            db.collection("users").doc(user.uid).update({
                dark: true
            });
        }
        else if(color === false){
            document.body.style.backgroundColor = "white";
            db.collection("users").doc(user.uid).update({
                dark: false
            });
        }
    });

    generateEditProfileForm();
}

export function handleLogOut(event){
    auth.signOut()
    .then(()=>{
        window.location.href = 'index.html';
    });
}