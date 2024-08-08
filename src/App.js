import { Component } from "react";
import ParticlesBg from "particles-bg";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import Navigation from "./components/Navigation/Navigation";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import "./App.css";

const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: "signin",
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  },
};

class App extends Component {
  constructor() {
    super();

    this.state = initialState;
  }

  handleLoadUser = (user) => {
    this.setState(() => {
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          entries: user.entries,
          joined: user.joined,
        },
      };
    });
  };

  calculateFaceLocation = (data) => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  displayFaceBox = (box) => {
    this.setState(() => {
      return { box: box };
    });
  };

  handleRouteChange = (route) => {
    if (route === "signout") {
      this.setState(() => {
        return initialState;
      });
    } else if (route === "home") {
      this.setState(() => {
        return { isSignedIn: true };
      });
    }
    this.setState(() => {
      return { route: route };
    });
  };

  handleInputChange = (event) => {
    this.setState(() => {
      return { input: event.target.value };
    });
  };

  handleButtonSubmit = () => {
    this.setState(() => {
      return { imageUrl: this.state.input };
    });
    fetch("https://infinite-gorge-77240-07061c850fea.herokuapp.com/imageurl", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: this.state.input,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result) {
          fetch(
            "https://infinite-gorge-77240-07061c850fea.herokuapp.com/image",
            {
              method: "put",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: this.state.user.id,
              }),
            },
          )
            .then((response) => response.json())
            .then((count) => {
              this.setState(() => {
                return Object.assign(this.state.user, { entries: count });
              });
            })
            .catch(console.log);
        }
        this.displayFaceBox(this.calculateFaceLocation(result));
      })
      .catch((error) => console.log("error", error));
  };
  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    const { handleRouteChange, handleInputChange, handleButtonSubmit } = this;
    return (
      <div className="App">
        <ParticlesBg type="cobweb" num={150} bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={handleRouteChange} />
        {this.state.route === "home" ? (
          <>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ImageLinkForm
              onInputChange={handleInputChange}
              onButtonSubmit={handleButtonSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </>
        ) : route === "signin" ? (
          <Signin
            onLoadUser={this.handleLoadUser}
            onRouteChange={handleRouteChange}
          />
        ) : (
          <Register
            onLoadUser={this.handleLoadUser}
            onRouteChange={handleRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;
