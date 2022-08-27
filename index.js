const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


//渲染函式：電影清單
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title.image
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
    dataPanel.innerHTML = rawHTML
  });

}

//渲染函式：電影資料視窗modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTitle.innerHTML = data.title
    modalDate.innerText = 'Release Date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" class="card-img-top img-fluid" alt="Movie Poster" />`

  })
}

//渲染函式：分頁器paginator
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}


// 加入收藏函式
function addToFavorite(id) {
  console.log(id)
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  //在 movies 陣列中，用id識別出該筆收藏的電影資料 
  const movie = movies.find((movie) => movie.id === id)

  //錯誤處理：已經在收藏清單的電影，不應被重複加
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  //將那部 movie 資料暫存起來放到收藏清單
  list.push(movie)

  //將收藏清單存到 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//函式：將資料依頁分段
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //slice包含起始，不含結尾
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)//展開大陣列並加進空陣列
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))


//監聽事件：data-panel(show-modal & add favorite)
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id)) //抓到點擊的電影id
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id)) //抓到喜歡的電影id
  }
})


//監聽事件：search功能
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()

  //篩選符合關鍵字的項目
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  //重新輸出至畫面
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})


//監聽事件：點擊分頁器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  const page = Number(event.target.dataset.page)
  if (event.target.tagName !== 'A') return

  renderMovieList(getMoviesByPage(page))
})