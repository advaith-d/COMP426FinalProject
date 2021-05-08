const baseURL = 'https://api.themoviedb.org/3/';
const APIKey = '119ee26a5933bb494a0a06de3fb035a3';
const streamingAPIKey = 'n4gKk589hMlg7ErWXVPJVRkK4MIkGLqJBwufBhFY';
let movieId;
let index = 0;
let page = 1;
let streamersID = {203: "Netflix", 157: "Hulu", 26: "Amazon Prime", 387: "HBO Max", 372: "Disney+", 371: "AppleTV+"};

$(function(){
    load();
})

export function load(){
    $(document).on('click', '#like', function(){handleLikeButtonPress(this);});
    $(document).on('click', '#dislike', function(){handleDislikeButtonPress(this)});
    $(document).on('click', '#unseen', function(){handleNotSeenButtonPress(this)});
    $(document).on('click', '#redundant', function(){handleAlreadySeenButtonPress(this)});
    $(document).on('click', '#logout', function(){handleLogOut(this)});
    generateMovie();
    
};

export function generateMovie(){
    if(index == 19){
        page++;
        index = 0;
    }
    fetch(baseURL + 'discover/movie?api_key=' + APIKey + '&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&vote_count.gte=200&page=' + page)
    .then((result)=>{
        return result.json();
    }).then((data)=>{
        let movieList = data.results;
        movieId = movieList[index].id;
        index++;
        auth.onAuthStateChanged(function(user){
            if (user) {
                let userData = db.collection("users").doc(user.uid);
                userData.get().then((doc) =>{
                    let likes = doc.data().liked;
                    let dislikes = doc.data().disliked;
                    for(let i = 0; i < likes.length; i++){
                        if(likes[i] === movieId){
                            generateMovie();
                        }
                    }
                    for(let i = 0; i < dislikes.length; i++){
                        if(dislikes[i] === movieId){
                            generateMovie();
                        }
                    }
                });
            }
        });

        fetch(baseURL + 'movie/' + movieId + '?api_key=' + APIKey)
        .then((result)=>{
            return result.json();
        })
        .then((data) =>{
            let date = data.release_date.substring(0, 4);
            
            document.getElementById("film").innerHTML = `<figure><img src="https://image.tmdb.org/t/p/w342` + data.poster_path + `">
                                                            <figcaption class="movie">` + data.title + ` (` +  date + `) </figcaption></figure>`;

            fetch('https://api.watchmode.com/v1/search/?apiKey=' + streamingAPIKey + '&search_field=imdb_id&search_value=' + data.imdb_id, {method:'Get'})
            .then((res) => res.json())
            .then((sources)=>{
                let streamingId = sources.title_results[0].id;
                fetch('https://api.watchmode.com/v1/title/' + streamingId + '/sources/?apiKey=' + streamingAPIKey + '&region=us', {method:'Get'})
                .then((res) => res.json())
                .then((sources)=>{
                    let sourcesList = sources.filter(element => element.region === "US" && element.type == "sub");
                    let streamingAvailability = `<p>Available to watch on:</p><ul>`;
                    
                    if(sourcesList.length > 0){
                        for(let i = 0; i < sourcesList.length; i++){
                            if(sourcesList[i].source_id in streamersID){
                                streamingAvailability = streamingAvailability.concat(`<li><p>` + streamersID[sourcesList[i].source_id] + `</p></li>`);
                            };
                        };
                    };
                    streamingAvailability = streamingAvailability.concat(`</ul>`);
                    document.getElementById("streaming").innerHTML = streamingAvailability;
                });
            });
        })
        .catch(function(error){
            alert(error);
        });
    }).catch(function(error){
        generateMovie();
    })
};

export function handleLikeButtonPress(event){
    auth.onAuthStateChanged(function(user){
        let userData = db.collection("users").doc(user.uid);
        let notSeen = false;
        userData.get().then((doc) =>{
            doc.data().notSeen.forEach((movie) => {
                if(movie === movieId){
                    notSeen = true;
                }
            })
            if(notSeen){
                //removing movie from not seen
                db.collection("users").doc(user.uid).update({
                    notSeen: firebase.firestore.FieldValue.arrayRemove(movieId)
                })
                //adding it to liked list
                db.collection("users").doc(user.uid).update({
                    liked: firebase.firestore.FieldValue.arrayUnion(movieId)
                }).then(()=>{
                    generateMovie();
                });
            }
            else{
                db.collection("users").doc(user.uid).update({
                    liked: firebase.firestore.FieldValue.arrayUnion(movieId)
                }).then(()=>{
                    generateMovie();
                });
            }
        });
    })
}

export function handleDislikeButtonPress(event){
    auth.onAuthStateChanged(function(user){
        let userData = db.collection("users").doc(user.uid);
        let notSeen = false;
        userData.get().then((doc) =>{
            doc.data().notSeen.forEach((movie) => {
                if(movie === movieId){
                    notSeen = true;
                }
            })
            if(notSeen){
                //removing movie from not seen
                db.collection("users").doc(user.uid).update({
                    notSeen: firebase.firestore.FieldValue.arrayRemove(movieId)
                })
                //adding it to disliked list
                db.collection("users").doc(user.uid).update({
                    disliked: firebase.firestore.FieldValue.arrayUnion(movieId)
                }).then(()=>{
                    generateMovie();
                });
            }
            else{
                db.collection("users").doc(user.uid).update({
                    disliked: firebase.firestore.FieldValue.arrayUnion(movieId)
                }).then(()=>{
                    generateMovie();
                });
            }
        });
    })
}

export function handleNotSeenButtonPress(event){
    let user = auth.currentUser;
    db.collection("users").doc(user.uid).update({
        notSeen: firebase.firestore.FieldValue.arrayUnion(movieId)
    }).then(()=>{
        generateMovie();
    });
}

export function handleAlreadySeenButtonPress(event){
    generateMovie();
}

export function handleLogOut(event){
    auth.signOut()
    .then(()=>{
        window.location.href = 'index.html';
    });
}
