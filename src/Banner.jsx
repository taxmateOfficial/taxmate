import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron'
import Container from 'react-bootstrap/Container'

class Banner extends React.Component 
{
    render() 
    {
        return (
            <Jumbotron fluid id="jumbo">
            <Container>
              <h1>TaxMate</h1>
              <p>Simplify your taxes & Simplify your life</p>
              <i>FY 2024 - 2025</i>
            </Container>
            <span id="myname">- Taxmates, {new Date().getFullYear()}</span>
          </Jumbotron>
        )
    }
  }

  export default Banner