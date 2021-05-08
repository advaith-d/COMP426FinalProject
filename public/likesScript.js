const baseURL = 'https://api.themoviedb.org/3/';
const APIKey = '119ee26a5933bb494a0a06de3fb035a3';


$(function(){
    load();
})

export function load(){
    generateLikesGallery();
    $(document).on('click', '#logout', function(){handleLogOut(this)});
}

export function generateLikesGallery(){
    let posters =``;
    auth.onAuthStateChanged(function(user) {
        if (user) {
            let userData = db.collection("users").doc(user.uid);
            userData.get().then((doc) =>{
                let likes = doc.data().liked;
                likes.forEach(element => {
                    fetch(baseURL + 'movie/' + element + '?api_key=' + APIKey)
                    .then((result)=>{
                        return result.json();
                    })
                    .then((data)=>{
                        posters = posters.concat(`<div class="gallery"><img src="https://image.tmdb.org/t/p/w185` + data.poster_path + `"></div>`);
                        document.getElementById("likes").innerHTML = posters;
                    })
                });
                
            })
        } else {
            alert("No user signed in.");
        }
    });
}

export function handleLogOut(event){
    auth.signOut()
    .then(()=>{
        window.location.href = 'index.html';
    });
}
