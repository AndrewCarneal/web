
import React from 'react';
import { GoogleApiWrapper } from 'google-maps-react';
//import {ProviderProps} from 'google-maps-react';
import { Marker } from 'google-maps-react';
import { Map } from 'google-maps-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import "./DistanceGroupItem.scss"
import { Button } from 'react-bootstrap';



interface Props extends RouteComponentProps {
  content: any,
  google: any

}
interface State {
  content: any,
  selectedPlace: any,
  listData: any
}

export class ContentItem extends React.Component<Props, State>  {
  constructor(props: Props) {
    super(props);
    console.log(props)
    this.state = {
      content: props.content,
      selectedPlace: null,
      listData: null
    }
    this.navigate = this.navigate.bind(this);
    if (this.state.content.class === "home-church") {

    }
    else {
      fetch('/static/data/distance-groups.json').then(function (response) {
        return response.json();
      })
        .then((myJson) => {
          this.setState({ listData: myJson });
        })
    }
  }
  navigate(to: string) {
    this.props.history.push(to, "as")
    const unblock = this.props.history.block('Are you sure you want to leave this page?');
    unblock();

  }

  onMarkerClick() { }
  onInfoWindowClose() { }

  render() {
    var inititalCenter: any;
    var initalZoom;
    if (this.state.content.class === "home-church") {
      inititalCenter = {
        lat: 44,
        lng: -78.0

      }
      initalZoom = 6
    }
    else {
      inititalCenter = {
        lat: 0,
        lng: -0
      }
      initalZoom = 1
    }

    return (

      <div className="ContentItem oneImage distancegroupitem1" >
        <div className="distancegroupitemdiv1" >
          <div  >
            <h1  >{this.state.content.header1}</h1>
            <div className="distancegroupitemdiv2" >
              <Map google={this.props.google} zoom={initalZoom} initialCenter={inititalCenter} className="distancegroupmap" >
                {this.state.listData != null ? this.state.listData.map((item: any) => {
                  return (<Marker onClick={this.onMarkerClick}
                    position={{ lat: item.location.latitude, lng: item.location.longitude }} />
                  )
                }) : null}
              </Map>
            </div>
            <div className="distancegroupitemdiv3" >
              {this.state.listData != null ? this.state.listData.map((item: any) => {
                if (this.state.content.class === "home-church") {
                  return (
                    <div >{item.name}
                      <Button onClick={() => this.navigate(item.id)}>Site Page</Button>
                    </div>
                  )
                }
                else {
                  return (
                    <div className="distancegroupitemdiv4" >
                      <h3>{item.name}</h3>
                      <div>{item.dayofweek}/{item.frequency}</div>
                      <div>Leaders: <a href={"mailto:" + item.l1Email}>{item.l1FirstName} {item.l1LastName} ({item.l1Email})</a></div>
                      {item.l2Email != null ? <div><a href={"mailto:" + item.l2Email}>{item.l2FirstName} {item.l2LastName} ({item.l2Email})</a></div> : null}
                      {item.l3Email != null ? <div><a href={"mailto:" + item.l3Email}>{item.l3FirstName} {item.l3LastName} ({item.l3Email})</a></div> : null}
                      {item.l4Email != null ? <div><a href={"mailto:" + item.l4Email}>{item.l4FirstName} {item.l4LastName} ({item.l4Email})</a></div> : null}
                      {item.facebook != null ? <div ><a href={item.facebookLink} className="distancegroupitemA" ><img className="distancegroupitemImage" src="/static/svg/Facebook.svg" alt="Facebook Logo" />{item.facebook}</a> </div> : null}

                    </div>
                  )
                }
              }) : null}

            </div>
          </div>
        </div>
      </div>
    )

  }
}

export default GoogleApiWrapper({
  apiKey: ('AIzaSyDXxLzyv5pYsIPl3XnVX5ONklXvs48zjn0')
})(withRouter(ContentItem))
