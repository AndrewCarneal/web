
import React, { EventHandler, SyntheticEvent, CSSProperties } from 'react';
import { Button } from 'reactstrap';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import AddToCalendar from 'react-add-to-calendar';
import PropTypes from "prop-types";
import "./HeroItem.scss"
import Select from 'react-select';
import DataLoader, { LocationData, LocationQuery } from './DataLoader';
import moment from 'moment';
import ScaledImage from 'components/ScaledImage/ScaledImage';
import { Link, LinkButton } from 'components/Link/Link';

interface Props extends RouteComponentProps {
  content: LocationQuery;
  data: any;
}
interface State {
  content: any;
  locationData: LocationData[];
  arrowOpacity: any;
}
class HeroItem extends React.Component<Props, State> {
  static contextTypes = {
    router: PropTypes.object,
    history: PropTypes.object
  }

  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      content: props.content,
      locationData: [],
      arrowOpacity: 1
    }
    this.navigate = this.navigate.bind(this);
    this.setData = this.setData.bind(this);

  }
  async componentDidMount() {
    const query = this.props.content;
    if (query.class === 'locations') {
      const data = await DataLoader.getLocations(query);
      this.setData(data);
    }
  }

  setData(data: LocationData[]) {
    this.setState({
      locationData: this.state.locationData.concat(data),
    });
  }
  getCalendarEventForLocation(locationItem: LocationData) {
    let nextSunday = (moment().day() === 0 ? moment().add(1, "week") : moment().day(0)).startOf("day");
    let serviceHour = locationItem.serviceTimes[locationItem.serviceTimes.length - 1];
    serviceHour = serviceHour.substr(0, serviceHour.indexOf(":"));
    nextSunday = nextSunday.hour(+serviceHour);
    const event = {
      title: 'Church at The Meeting House',
      description: 'Join us at The Meeting House on Sunday!',
      location: locationItem.location.address,
      startTime: nextSunday.format(),
      endTime: moment(nextSunday).add(90, "minutes").format()
    }
    return event;
  }

  locationChange(item: any) {
    this.props.history.push('/' + item.value)
  }
  navigate() {
    this.props.history.push("spirituality", "as")
    const unblock = this.props.history.block('Are you sure you want to leave this page?');
    unblock();

  }
  navigateTo(location: string) {
    if (location.includes(".")) {
      window.location.href = location
    } else {
      this.props.history.push(location, "as")
      const unblock = this.props.history.block('Are you sure you want to leave this page?');
      unblock();
    }
  }
  smoothScrollTo(endX: any, endY: any, duration: any) {
    const startX = window.scrollX || window.pageXOffset,
      startY = window.scrollY || window.pageYOffset,
      distanceX = endX - startX,
      distanceY = endY - startY,
      startTime = new Date().getTime();

    // Easing function
    const easeInOutQuart = function (time: any, from: any, distance: any, duration: any) {
      if ((time /= duration / 2) < 1) return distance / 2 * time * time * time * time + from;
      return -distance / 2 * ((time -= 2) * time * time * time - 2) + from;
    };

    const timer = window.setInterval(function () {
      const time = new Date().getTime() - startTime,
        newX = easeInOutQuart(time, startX, distanceX, duration),
        newY = easeInOutQuart(time, startY, distanceY, duration);
      if (time >= duration) {
        window.clearInterval(timer);
      }
      window.scrollTo(newX, newY);
    }, 1000 / 60); // 60 fps
  }
  scrollToNextPage() {
    const pos = window.outerHeight;
    if ('scrollBehavior' in document.documentElement.style) { //Checks if browser supports scroll function
      window.scroll({
        top: pos,
        left: 0,
        behavior: 'smooth'
      });
    } else {
      this.smoothScrollTo(0, pos, 500); //polyfill below
    }

  }

  private fadeIn(style: CSSStyleDeclaration) {
    style.transition = "opacity 1s";
    style.opacity = "1";
  }

  downArrowScroll() {
    //console.log(window.scrollY)
    const downArrow = document.getElementById('downArrow')
    if (downArrow)
      downArrow.style.opacity = ((1 - (window.scrollY / 250))).toString()
  }

  renderEmailSignup() {
    return (
      <div>
        <link href="//cdn-images.mailchimp.com/embedcode/horizontal-slim-10_7.css" rel="stylesheet" type="text/css" />
        <div id="mc_embed_signup" className="signupContainer">
          <form action="https://themeetinghouse.us8.list-manage.com/subscribe/post?u=3c4d56c1d635f336d8656e9dd&amp;id=3cb55a9826"
            method="post" id="mc-embedded-subscribe-form"
            name="mc-embedded-subscribe-form" className="validate" target="_blank">
            <div className="emailDiv" aria-hidden="true">
              <input className="emailInput" type="text" name="b_3c4d56c1d635f336d8656e9dd_3cb55a9826" value="" />
            </div>
            <div id="mc_embed_signup_scroll" className="signupButtons">
              <div className="emailWrapper">
                <img className="contactIcon" alt="Contac Icon" src="/static/svg/Contact.svg"></img>
                <input type="email" name="EMAIL" className="email" id="mce-EMAIL" placeholder="email address" />
              </div>
              <input type="submit" value="Sign Me Up" name="subscribe" className="heroButton" id="mc-embedded-subscribe" />
            </div>
          </form>
        </div>
      </div>
    )
  }

  renderHeroImage(className: string) {
    const image1 = this.state.content.image1[
      Math.floor(Math.random() * this.state.content.image1.length)
    ];
    let onLoad: EventHandler<SyntheticEvent<HTMLImageElement>> | undefined;
    let style: CSSProperties | undefined;
    if (className === 'heroImage') {
      onLoad = (event) => this.fadeIn(event.currentTarget.style);
      style = { opacity: 0 };
    }
    return (
      image1.src.includes('.svg') ?
        <img src={image1.src} alt={image1.alt} className={className} /> :
        <ScaledImage image={image1} className={className} style={style} onLoad={onLoad} breakpointSizes={{
          320: 320,
          480: 480,
          640: 640,
          1280: 1280,
          1920: 1920,
          2560: 2560,
        }} />
    );
  }

  render() {
    window.onscroll = () => { this.downArrowScroll() }
    if (this.state.content.style === "full") {
      return (
        <div className="headerItem heroItem" >
          <div className="heroImageGradient" onClick={() => { this.scrollToNextPage() }}></div>
          {this.renderHeroImage("heroImage")}
          <div className="heroBlackBox" >
            <h1 className="heroH1" >{this.state.content.header1}</h1>

            {this.state.locationData.length === 1 ? <h2 className="heroH2">{this.state.locationData[0].location.address}</h2>
              : this.state.content.header2 && <h2 className="heroH2">{this.state.content.header2}</h2>}
            <hr className="heroHr"></hr>
            <div className="heroText1" >{this.state.content.text1}</div>
            <div className="heroText2" >{this.state.content.text2}</div>
            <div className="heroText2" >{this.state.content.text3}</div>
            <div className="heroText2" >{this.state.content.text4}</div>
            <div className="heroText2" >{this.state.content.text5}</div>
            <div className="heroText2" >{this.state.content.text6}</div>
            <div className="heroText2" >{this.state.content.text7}</div>
            {this.state.content.button1Text ? (<LinkButton className="heroButton" to={this.state.content.button1Action}>{this.state.content.button1Text}</LinkButton>) : null}
            {this.state.content.link1Text ? <div className="heroAContainer"><Link className="heroBlackBoxA inverted" to={this.state.content.link1Action}>{this.state.content.link1Text}</Link></div> : null}
            {
              this.state.content.addToCalendar ?
                this.state.locationData.length === 1 ?
                  <div className="HeroAddToCalendarButtonContainer">
                    <img className="SundaMorningIcon" src="/static/svg/Calendar-white.svg" alt="Calendar Icon" />
                    <AddToCalendar buttonLabel="Add to Calendar" event={this.getCalendarEventForLocation(this.state.locationData[0])} ></AddToCalendar>
                  </div>

                  : null
                : null
            }
            {this.state.content.contactPastor ?
              this.state.locationData.length === 1 ? (
                <a href={"mailto:" + this.state.locationData[0].pastorEmail}><button className="calendarButton"><img className="calendarImage" src="/static/svg/Contact-white.svg" alt="Contact Icon" />Contact the Pastor</button></a>)
                : null
              : null}
            <br />
          </div>
          {this.state.content.showCovid ? <div className="covidButton"><Button onClick={() => { this.navigateTo("covid19") }} className="covidButtonDetail">COVID-19 Update</Button></div> : null}
          <div><img id="downArrow" style={{ opacity: this.state.arrowOpacity, cursor: "pointer" }} src="/static/svg/DownArrow.svg" className="downarrow animated bounce" alt="Down Arrow" onClick={() => { this.scrollToNextPage() }} /> </div>
        </div>

      )
    }
    else if (this.state.content.style === "partialNoFooter") {

      return (
        <div className="partialNoFooter" >
          {this.renderHeroImage("partialNoFooterImage")}
          <div className="partialNoFooterBox" >
            <h1 className="heroH1" >{this.state.content.header1}</h1>
            {this.state.content.header2 && <h2 className="heroH2" >{this.state.content.header2}</h2>}
            <hr className="partialNoFooterBoxHr" ></hr>
            <div className="heroText1">{this.state.content.text1}</div>
            <div className="heroText1">{this.state.content.text2}</div>
            <div className="heroText2">{this.state.content.text3}</div>
            <div className="heroText2">{this.state.content.text4}</div>
            <div className="heroText2">{this.state.content.text5}</div>
            <div className="heroText2">{this.state.content.text6}</div>
            <div className="heroText2">{this.state.content.text7}</div>
            {this.state.content.showLocationSearch ? (
              <div>
                {this.state.locationData != null ?
                  <Select onChange={(item) => { this.locationChange(item) }}
                    styles={{

                      menuPortal: styles => ({ ...styles, zIndex: 999 }) //  >= dialog's z-index
                    }}
                    placeholder="Search for a church by city" className="partialNoFooterLocationDropDown"
                    options={this.state.locationData.map(
                      (item: any) => {
                        return { label: item.name, value: item.id }
                      }
                    ).sort((a: any, b: any) => {
                      return a.label.localeCompare(b.label)
                    })
                    }></Select>
                  : null}
              </div>) : null}
            {this.state.content.button1Text ? (<Button className="heroItemButton" onClick={() => { this.navigateTo(this.state.content.button1Action) }}>{this.state.content.button1Text}</Button>) : null}
            <Link className="inverted" to={this.state.content.link1Action}>{this.state.content.link1Text}</Link>
            {this.state.content.addToCalendar ? (<Button className="heroItemButton" onClick={this.navigate}><img src="/static/svg/Calendar, Add To.svg" alt="Calendar Icon" />Add To Calendar</Button>) : null}
            {this.state.content.contactPastor ? (<Button className="heroItemButton" onClick={this.navigate}><img src="/static/svg/Contact.svg" alt="Contact Icon" />Contact the Pastor</Button>) : null}
          </div>
        </div>
      )
    }
    else if (this.state.content.style === "partial") {

      return (
        <div className="headerItem divPartial" >
          {this.renderHeroImage("partial")}
          <div className="heroPartialBlackBox" >
            <h1 className="heroH1" >{this.state.content.header1}</h1>
            {this.state.content.header2 && <h2 className="heroH2">{this.state.content.header2}</h2>}
            <hr className="heroHr"></hr>
            <div className="heroText1" >{this.state.content.text1}</div>
            <div className="heroText2" >{this.state.content.text2}</div>
            <div className="heroText2" >{this.state.content.text3}</div>
            <div className="heroText2" >{this.state.content.text4}</div>
            <div className="heroText2" >{this.state.content.text5}</div>
            <div className="heroText2" >{this.state.content.text6}</div>
            <div className="heroText2" >{this.state.content.text7}</div>
            {this.state.content.showLocationSearch ? (
              <div>
                {this.state.locationData != null ?
                  <Select menuPortalTarget={document.querySelector('body')} X
                    styles={{

                      menuPortal: styles => ({ ...styles, zIndex: 999 }) //  >= dialog's z-index
                    }}
                    onChange={(item) => { this.locationChange(item) }}
                    placeholder="Search for a church by city" className="partialLocationDropDown"
                    options={this.state.locationData.map(
                      (item: any) => {
                        return { label: item.name, value: item.id }
                      }
                    ).sort((a: any, b: any) => {
                      return a.label.localeCompare(b.label)
                    })
                    }></Select>
                  : null}
              </div>) : null}
            {this.state.content.button1Text ? (<Button className="heroButton" onClick={() => { this.navigateTo(this.state.content.button1Action) }}>{this.state.content.button1Text}</Button>) : null}
            {this.state.content.link1Text ? <div className="heroAContainer">
              <Link className="HeroItemA2 inverted" to={this.state.content.link1Action}>{this.state.content.link1Text}</Link>
            </div> : null}
            {this.state.content.addToCalendar ? (<Button className="heroItemButton" onClick={this.navigate}><img src="/static/Calendar.png" alt="Calendar Icon" />Add To Calendar</Button>) : null}
            {this.state.content.contactPastor ? (<Button className="heroItemButton" onClick={this.navigate}><img src="/static/Contact.png" alt="Contact Icon" />Contact the Pastor</Button>) : null}

          </div>

        </div>
      )
    } else if (this.state.content.style === "connect") {
      return (
        <div className="partialConnect" >
          {this.renderHeroImage("partialConnectImage")}
          <div className="partialConnectBox" >
            <h1 className="heroH1" >{this.state.content.header1}</h1>
            {this.state.content.header2 && <h2 className="heroH2">{this.state.content.header2}</h2>}
            <hr className="heroHr"></hr>
            <div className="heroText1" >{this.state.content.text1}</div>
            <div className="heroText2" >{this.state.content.text2}</div>
            <div className="heroText2" >{this.state.content.text3}</div>
            <div className="heroText2" >{this.state.content.text4}</div>
            <div className="heroText2" >{this.state.content.text5}</div>
            <div className="heroText2" >{this.state.content.text6}</div>
            <div className="heroText2" >{this.state.content.text7}</div>
            {this.renderEmailSignup()}
          </div>
        </div>
      )
    }
    else return null
  }
}


export default withRouter(HeroItem)