import React, { Component } from 'react';
// import {GoogleApiWrapper} from 'google-maps-react';
import { render } from 'react-dom';
import axios from 'axios';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Header from './components/header.jsx';
import MapContainer from './components/mapContainer.jsx';
import UserPage from './components/userpage.jsx';
import PinInfo from './components/pininfo.jsx';
import Toc from './components/toc.jsx';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

injectTapEventPlugin();

class MapView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCenter: {
        lat: 37.774929,
        lng: -122.41941600000001
      },
      zoom: 15,
      markers: [],
      mapId: null,
      currPin: null
    };
    // this.MapContainer2;
    this.updateCenter = this.updateCenter.bind(this);
    this.updateZoom = this.updateZoom.bind(this);
    this.addMarker = this.addMarker.bind(this);
    // this.replaceURL = (id) => props.history.push(`?=${id}`);
    this.setCurrPin = this.setCurrPin.bind(this);
    this.updateCurrPinInfo = this.updateCurrPinInfo.bind(this);
    this.save = this.save.bind(this);
  }

  setCurrPin(index) {
    this.setState({
      currPin: index
    });
  }

  // componentWillMount() {
  //   axios.get('/api')
  //     .then((res) => {
  //       console.log("Setting window api key", window.GOOGLE_API_KEY);
  //       //window.GOOGLE_API_KEY = res.data.GOOGLE_API_KEY;
  //       // import MapContainer from './components/mapContainer.jsx';
  //       // this.MapContainer2 = GoogleApiWrapper({
  //       //   apiKey: window.GOOGLE_API_KEY
  //       // })(MapContainer);
  //     })
  //     .catch(err => {
  //       console.log('Cannot get api key:', err);
  //     });
  // }

  componentDidMount() {
    let mapId = window.location.href.split('=')[1];
    if (mapId) {
      this.fetch(mapId);
    }
  }

  // addMarker(position) {
  //   let markers = this.state.markers;
  //   markers.push({
  //     position: position
  //   });

  // Changed this function to accept a marker object instead of only a position.
  addMarker(marker) {
    console.log('Currently the marker list is:', this.state.markers);
    var markers = this.state.markers;
    markers.push(marker);
    this.setState({
      markers: markers
    });
  }

  github() {
    axios.get('/auth/github')
      .then(res => {
        console.log('github response:', res);
      })
      .catch(err => console.log('ERROR:', err));
  }

  save(mapTitle) {
    let state = this.state;
    state.title = mapTitle;
    state.currentUser = this.props.currentUser;
    axios.post('/map', {state: JSON.stringify(state)})
      .then(res => {
        this.setState({ mapId: res.data });
        // console.log('Data is:', res.data);
        // this.replaceURL(res.data);
      })
      .catch(err => console.log(err));
  }

  update() {
    let state = JSON.stringify(this.state);
    let mapId = window.location.href.split('=')[1];
    axios.put(`/map/${id}`, {state: state})
      .then((res) => {
        console.log(res);
      })
      .catch(err => console.log('put error:', err));
  }

  fetch(id) {
    console.log('About to run a get request for the state');
    axios.get(`/map/${id}`)
      .then(res => {
        console.log('got the data:', res.data);
        this.setState(res.data);
      })
      .catch(err => console.log('get error:', err));

  }

  updateCenter(center) {
    this.setState({
      currentCenter: center
    });
  }

  updateZoom(zoom) {
    this.setState( {
      zoom: zoom
    });
  }

  updateCurrPinInfo(text) {
    console.log('Update the curr pin with', text);

    let markers = this.state.markers;
    markers[this.state.currPin].info = text;
    this.setState({
      markers: markers
    });
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <Toc save={this.save} />
          <MapContainer
            currentCenter={this.state.currentCenter}
            updateCenter={this.updateCenter}
            updateZoom={this.updateZoom}
            markers={this.state.markers}
            addMarker={this.addMarker}
            zoom={this.state.zoom}
            setCurrPin={this.setCurrPin}
          />
          {this.state.currPin !== null &&
            <PinInfo text={this.state.markers[this.state.currPin].info}
              updateCurrPinInfo={this.updateCurrPinInfo}
            />
          }
        </div>
      </MuiThemeProvider>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null
      // title: ''
    };
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentWillMount() {
    axios.get('/user/signedIn')
      .then((res) => {
        if (res.data.email) {
          this.setState({
            currentUser: res.data
          });
        }
      })
      .catch(err => console.log('signedIn error:', err));
  }

  handleLogout() {
    axios.get('/logout').then(res => {
      this.setState({ currentUser: null });
    });
  }

  // updateTitle(e) {
  //   console.log('update title: ', e.target.value);
  //   this.setState({title: e.target.value});
  // }

  render () {
    return (
      <MuiThemeProvider>
        <div>
          <Router history={history}>
            <div>
              <Header
                handleLogout={this.handleLogout}
                currentUser={this.state.currentUser}
              />
              <Route exact path='/' component={() => (
                <MapView currentUser={this.state.currentUser}/>
              )} />
              <Route exact path='/profile' component={() => (
                <UserPage currentUser={this.state.currentUser} />
              )}/>
            </div>
          </Router>
        </div>
      </MuiThemeProvider>
    );
  }
}
render(<App />, document.getElementById('app'));
