"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(q) {
  try {
    const res = await axios.get('https://api.tvmaze.com/search/shows', {
      params: {
        q: q
      }
    });
    const shows = res.data.map(showItem => {
      const show = showItem.show;
      return {
        id: show.id,
        name: show.name,
        summary: show.summary || "No information given.",
        image: show.image ? show.image.medium : "https://tinyurl.com/tv-missing"
      };
    });

    return shows;
  } catch (error) {
    console.error('Error fetching shows:', error);
    return [];
  };
};

/** Given list of shows, create markup for each and to DOM */
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);
// Attach click event listener to the "Episodes" button
const $episodesButton = $(".Show-getEpisodes");
$episodesButton.on("click", async function() {
  const showId = $(this).closest('.Show').data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodesInModal(episodes);

  // Show the modal without backdrop -- backdrop causes errors with page not loading
  const myModal = new bootstrap.Modal(document.getElementById('episodesModal'), {
    backdrop: false
  });
  myModal.show();
});


    $showsList.append($show);
  };
};


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
};

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


async function getEpisodesOfShow(id) {
  try {
    const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
    return res.data.map(episode => ({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    }));
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return [];
  };
};

// Function to populate episodes in the modal
async function populateEpisodesInModal(episodes) {
  const ulElement = document.querySelector('#episodesListModal');
  ulElement.innerHTML = ""; // Clear any previous episodes

  // Loop through each episode and create a list item for each one
  episodes.forEach(episode => {
    const liElement = document.createElement("li");
    liElement.innerText = `Episode ${episode.number} (Season ${episode.season}): ${episode.name}`;
    ulElement.appendChild(liElement);
  });
};

