//an array, defining the routes
export default [

    {
        //the part after '#' in the url (so-called fragment):
        hash: "menu",
        ///id of the target html element:
        target: "router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-menu").innerHTML

    },
    {
        hash: "CsGo",
        target: "router-view",
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-Csgo").innerHTML
    },
    {
        hash: "Dota2",
        target: "router-view",
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-Dota2").innerHTML
    },
    {
        hash: "Earnings",
        target: "router-view",
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-Earnings").innerHTML
    },

    {
        hash: "TournamentsDota",
        target: "router-view",
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-TournamnetDota2").innerHTML
    },

    {
        hash: "TournamentsCSGO",
        target: "router-view",
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-TournamnetCSGO").innerHTML
    },


    {
        hash: "Survay",
        target: "router-view",
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-Survay").innerHTML
    },

    {
        hash: "opinions",
        target: "router-view",
        getTemplate: createHtml4opinions
    },

    {
        hash: "articles",
        target: "router-view",
        getTemplate: createHtml4Main

    },

    {
        hash: "artDelete",
        target: "router-view",
        getTemplate: deleteArticle
    },

    {
        hash: "artEdit",
        target: "router-view",
        getTemplate: editArticle
    },
    {
        hash: "article",
        target: "router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },
    {
        hash: "artInsert",
        target: "router-view",
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addarticle-form").innerHTML
    },
    {
        hash: "addcoment",
        target: "router-view",
        getTemplate: addcoments
    },

];

function createHtml4opinions(targetElm) {
    const opinionsFromStorage = localStorage.myTreesComments;
    let opinions = [];

    if (opinionsFromStorage) {
        opinions = JSON.parse(opinionsFromStorage);
        opinions.forEach(opinion => {
            opinion.created = (new Date(opinion.created)).toDateString();
            opinion.willReturn = opinion.willReturn ? "I will return to this page." : "Sorry, one visit was enough.";
        });
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-opinions").innerHTML,
        opinions
    );

}

//

const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 2;


let offset = 0;

async function createHtml4Main(targetElm, current, offsetFromHash, totalCountFromHash) {

    //  sessionStorage.setItem('page', current);
    const data4rendering = {
        currPage: current,
    };


    // if(sessionStorage.getItem('page', current) != null){
    //     current=sessionStorage.getItem('page', current);
    // }

    current = parseInt(current);

    offset = (current - 1) * 2

    let c = await fetchfortotal();

        data4rendering.prevPage = current - 1;

    if (offset < c - 2 ) {
        data4rendering.nextPage = current + 1;
    }
    scroll(0, 0);
    fetchAndDisplayArticles(targetElm, offset, totalCountFromHash, data4rendering)

}

const errorElm = document.getElementById("router-view");
const articlesElm = document.getElementById("router-view");


function fetchAndDisplayArticles(targetElm, offsetFromHash, totalCountFromHash, data4rendering) {



    offset = Number(offsetFromHash);
    const totalCount = Number(totalCountFromHash);

    let urlQuery = `?tag=riko&offset=${offset}&max=${articlesPerPage}`;


    const url = `${urlBase}/article${urlQuery}`;
    let meta;

    fetch(url)
        .then(response => response.json())
        .then((response) => {
            meta = response.meta
            let cntRequests = response.articles.map(
                article => fetch(`${urlBase}/article/${article.id}`)
            );
            return Promise.all(cntRequests);
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(articles => {
            articles = addArtDetailLink2ResponseJson(articles, meta);

            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles").innerHTML,
                    {articles, ...data4rendering},
                    {nav: document.getElementById('template-main').innerHTML}
                );
        })


}


function fetchAndDisplayArticleDetail(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle({targetElm, artIdFromHash, offsetFromHash, totalCountFromHash, isEdit: false, isDelete: false , isComment:false});
}

function fetchAndProcessArticle({ targetElm, artIdFromHash, offsetFromHash, totalCountFromHash, isDelete, isEdit ,isComment}) {
    const url = `${urlBase}/article/${artIdFromHash}`;



    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {

            if (isEdit) {

                responseJSON.formTitle = "Article Edit";
                responseJSON.formSubmitCall =
                    `processArtEditFrmData(event,${artIdFromHash},${offsetFromHash},'${urlBase}')`;
                responseJSON.submitBtTitle = "Save article";
                responseJSON.urlBase = urlBase;

                responseJSON.backLink = `#article/${artIdFromHash}/${offsetFromHash}`;
                var i=0;

                if(responseJSON["tags"].includes("riko")){
                    for( i = 0; i < responseJSON.tags.length ; i++) {
                        if(responseJSON.tags[i] == "riko"){
                            responseJSON.tags.splice(i,1);
                        }

                    }
                }

                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article-form").innerHTML,
                        responseJSON
                    );
            }
           else if(isDelete){

                    deletearticle(artIdFromHash).then(() => {
                        window.location.href = `#articles/${offsetFromHash/2 +1}`
                    })

                }
           else if(isComment) {

                addNewcomment(artIdFromHash,offsetFromHash);

            }else{

                responseJSON.backLink = `#articles/${offsetFromHash/2 +1}`;
                responseJSON.editLink = `#artEdit/${responseJSON.id}/${offsetFromHash}`;
                responseJSON.deleteLink =`#artDelete/${responseJSON.id}/${offsetFromHash}`;
                responseJSON.addcoment =`#addcoment/${responseJSON.id}/${offsetFromHash}`;
                responseJSON.addcomentcheck =`#addcomentcheck`;
                updateSignIn()
                f(artIdFromHash,targetElm,responseJSON)

            }

        })




}

function f(artIdFromHash,targetElm,responseJSON,offsetFromHash) {

    let urlQuery = `?offset=${0}&max=${100}`;
      fetch(`${urlBase}/article/${artIdFromHash}/comment${urlQuery}`)
        .then(response => response.json())


          .then(response =>{

              var i=0;

              if(responseJSON["tags"].includes("riko")){
                  for( i = 0; i < responseJSON.tags.length ; i++) {
                      if(responseJSON.tags[i] == "riko"){
                          responseJSON.tags.splice(i,1);
                      }

                  }
              }

              document.getElementById("router-view").innerHTML =
                  Mustache.render(
                      document.getElementById("template-article").innerHTML,
                      {...responseJSON,...response, artIdFromHash ,offsetFromHash},
                      {nave: document.getElementById('template-comments').innerHTML}
                  );

          });

}

function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle({targetElm, artIdFromHash, offsetFromHash, totalCountFromHash, isEdit: true, isDelete: false , isComment: false});
}
function deleteArticle(targetElm, artIdFromHash, offsetFromHash) {
    fetchAndProcessArticle({targetElm, artIdFromHash, offsetFromHash, isEdit: false, isDelete: true ,isComment: false});
}
function addcoments(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle({targetElm, artIdFromHash, offsetFromHash,totalCountFromHash, isEdit: false, isDelete: false , isComment: true});
}



function fetchfortotal() {
    const serverUrl = "http://wt.kpi.fei.tuke.sk/api/article";
    let urlQuery = `?tag=riko&offset=${offset}&max=${articlesPerPage}`;
    let meta = [];

    return fetch(serverUrl+urlQuery)  //there may be a second parameter, an object wih options, but we do not need it now.
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(new Error(`Failed to access the list of articles. Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(responseJSON => {
            meta = responseJSON.meta;
            return meta.totalCount;
        })


}

function addArtDetailLink2ResponseJson(articles, meta) {
    return articles.map(
        article => (
            {
                ...article,
                detailLink: `#article/${article.id}/${meta.offset}/${meta.totalCount}`
            }
        )
    );

}

