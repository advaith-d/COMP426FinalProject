$(function(){
    load();
})

export function load(){
    generateUser();
    $(document).on('click', "#clear", function(){clearSearchResults(this)});
    $(document).on('click', '#logout', function(){handleLogOut(this)});
    
};

export function generateUser(){
    auth.onAuthStateChanged(function(user){
        let userData = db.collection("users").doc(user.uid);
        userData.get().then((doc) =>{
            let dislikes = doc.data().disliked;
            let likes = doc.data().liked;
            
            db.collection("users").get().then((querySnapshot) =>{
                let users = ``;
                querySnapshot.forEach((doc)=>{
                    if(doc.data().id !== user.uid){
                        let total = dislikes.length + likes.length;
                        let similarities = 0;
                        for(let i = 0; i < dislikes.length; i++){
                            for(let j = 0; j < doc.data().disliked.length; j++){
                                if(dislikes[i] === doc.data().disliked[j]){
                                    similarities++;
                                }
                            }
                        }
                        
                        for(let i = 0; i < likes.length; i++){
                            for(let j = 0; j < doc.data().liked.length; j++){
                                if(likes[i] === doc.data().liked[j]){
                                    similarities++;
                                }
                            }
                        }
                        
                        total = total - similarities;
                        let percentSimilar;
                        if(total === 0){
                            percentSimilar = 100;
                        }
                        else{
                            percentSimilar = (similarities / total) * 100;
                            percentSimilar = Math.round(percentSimilar * 10) / 10;
                        }

                        users = users.concat(`<div class="card gallery" style="height:150px; background-color:rgba(155, 112, 255, 0.767); color:white;"><h3>` +  doc.data().username + `</h3><p>Taste Similarity:` + percentSimilar + `%</p></div>`);
                        document.getElementById("users").innerHTML = users;
                    }  
                })
            })
        });
    });    
}

export function clearSearchResults(event){
    document.querySelector(".selection").innerHTML = '';
    generateUser();
}

export function handleLogOut(event){
    auth.signOut()
    .then(()=>{
        window.location.href = 'index.html';
    });
}