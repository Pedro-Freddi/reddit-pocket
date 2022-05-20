/* This file is a documentation of the analysis process of Reddit's JSON API and layout of ideas for how
the application's state and features should be designed  */

// Conceptual model of how post objects will be stored in state
const state = {
  posts: [{
    author: "author",
    url: "https://reddit.com/linkto123...",
    text: "text",
    subreddit: "r/lalala",
    title: "title",
    num_comments: 50,
    created: 154663156,
    ups: 5000,
    downs: 0, // if ups === 0, downs will be > 0
    is_video: false,
    media: {
      url: "https://linktovideo.com",
      height: 480,
      width: 264
    },
  }]
}

/*  
API Analysis
fetch(...).then(json()).then(response) --> response.data.children --> returns an array of posts

Each post is an object with a data property that returns another object
with many properties about the post

posts[i].data --> object with post details

Relevant properties:

.author --> String with author's name; ex: "gyrozepp2"
.permalink --> String with link to the full post, ex: "/r/OnePiece/comments/umu2h0/one_piece_chapter_1049_spoilers/"
.selfText --> String with the text of the post in Markdown; ex: "Thanks to Etenboby from WG forums\n\nChapter 1049: **\"The world we should aspire to\"**\n\n* In the cover (...)"
.subreddit_name_prefixed --> String with name of subreddit; ex: "r/OnePiece"
.title --> String with title of the post; ex: "One Piece chapter 1049 spoilers"
.url --> String with full url of post; ex: "https://www.reddit.com/r/OnePiece/comments/umu2h0/one_piece_chapter_1049_spoilers/"
.created --> Number in milliseconds when post was created; ex: 1652215458
.num_comments --> Number with number of comments; ex: 3166
.ups --> Number of up votes received by the post; ex: 69834
.downs --> Number of down votes received by the post. It's zero in most cases
.is_video --> Boolean that informs if there's a video in the post
.media --> object containing the media of post
.secure_media --> seems to return the same as .media
.media.reddit_video --> has .dash_url and fallback_url relevant properties
.preview --> object containing preview of media
.thumbnail --> String containing a link to thumbnail; ex: https://b.thumbs.redditmedia.com/nQ-min_l6f62lxK5mYihBmpfXuofUL9FzX9zw1RZQNI.jpg
.post_hint --> undefined if only text; can also be image, link, and video (rich or hosted)

How state should work?

The Posts component needs to access an array of posts, regardless of details
about subreddit, search, etc. It will map the array to individual Post components,
passing appropriate info as props for Post to render.

So in state we will have the array of posts and Posts component will be subscribed
to it with useSelector to receive updates. But how is the array updated?

It needs to be fetched asynchronously using the Reddit JSON API, which is done 
by appending the Reddit target link with ".json".

So whenever we want to change the posts state, we need to make a call to the
API using the target link. If we want "Hot" posts, for example, we make the call
to "https://reddit.com/hot.json" and store the results appropriately in state.

This fetch must be triggered by a click on some link, like on the sidebar
or the hotbar. This can be translated to an action being dispatched to trigger
the fetching, which must be handled by an async thunk.

So how will the URL be updated and how will this update trigger the fetch
action?

Ideas:
1. The click on any link dispatches an action that will be handled by a thunk
which will perform two actions: get the target URL, which could be passed to 
the thunk by the dispatcher and perform the appropriate fetch. Then update the
posts state by dispatching a new action.

2. If using React Router, maybe get the current URL by using a hook and performing
the state update based on that, so the state should always reflect the current
link.

Additional points to consider:
- Need to analyze how the categories on sidebar will be displayed. Is there a 
way to fetch popular categories and display them dynamically or is it better
to hardcode some categories and their corresponding links?
- The target URLs of the hotbar must be dynamic because they depend on the current
selected subreddit. They must be generated by appending "/hot" or "/popular" to
the current link. Maybe React Router Link components can help with this?
- How will we show comments for each post? I can think of two ways:
1. A modal box will open when the user clicks on "Comments" on a post and it
will fetch the comments for the post and display in the same page.
2. The click on "Comments" redirects the user (with Router) to a different
view of the unique post with comments listed below the post. (I like this idea
better because comments list can be very extensive)

CATEGORY FETCHING - SIDEBAR COMPONENT

We'll display links to popular subreddits on the sidebar. These subreddits will
be programatically fetched and listed in the component.

fetch URL: "https://www.reddit.com/subreddits.json"
response.json() returns an array of 25 objects containing the subreddits info:

Ex:

const subredditArray = response.data.children;

subredditArray[0].data["icon_img"] // https://b.thumbs.redditmedia.com/EndDxMGB-FTZ2MGtjepQ06cQEkZw_YQAsOUudpb9nSQ.png
subredditArray[0].data["display_name"] // "Home"
subredditArray[0].data.id // "2qs0k" --> Use it as key property for React components
subredditArray[0].data.url // "/r/Home/"

COMMENTS FETCHING - COMMENTS COMPONENT

fetch URL type: "https://www.reddit.com/r/:subreddit/comments/:postid/:anotherid/.json"

response.json() returns an array containing two objects:
  1. First object contains information about the post
  2. Second object contains an array of comments in the children property

Each comment is an object. The following properties will be used to display comment information in UI.

NOTE: Before adding the object to comment's state array, must check if object.kind === "t1". There's the
object.kind === "more" that contains info about more comments.

.author --> String containing author's name
.body --> Markdown content with the text of the comment
.created --> Creation date in epoch seconds
.edited --> Date of last edition in epoch seconds
.id --> Id of comment
.permalink --> Link to comment
.replies --> Object containing an array of replies to this comment
.score --> Score of comment

SEARCHBAR FEATURE - Implementation Idea

Posts component

Select search term stored in state and check if it's empty.
If it's empty, compose a url to fetch using only pathname.
If it's not empty, compose a url to fetch using pathname and search term
as a query parameter. Pass it to getPosts() using dispatch and change the
location with useNavigate() to illustrate to the user where we're at.

useEffect(() => {
  if (searchTerm) {
    useNavigate(urlWithSearchQuery);
    dispatch(getPosts(urlWithSearchQuery));
  } else {
    dispatch(getPosts(urlWithoutSearchQuery))
  }


})

*/

