import React, { useEffect } from 'react';
import CardContainer from '../../components/CardContainer';
import { useShowAccountsQuery } from '../../slices/accountApiSlice';
import { useShowAllOperationsQuery } from '../../slices/operationApiSlice';
import { LinkContainer } from 'react-router-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Nav } from 'react-bootstrap';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import ContentBox from '../../components/ContentBox';
import { FaChevronCircleRight } from "react-icons/fa";
import ImageContainer from '../../components/ImageContainer';
import useCheckCookies from '../../utils/useCheckCookies';
import useSessionTimeout from '../../utils/useSessionTimeout';

const Home = () => {
  useCheckCookies();
  useSessionTimeout();

  return (
    <div className='box'>
      <ImageContainer />
      <div className="d-flex justify-content-around">
        <CardContainer id="CardContainer">
          <div className='box bg-dark text-white p-2 px-4 rounded-top-2'>
            <h2 className='card-title'>Clientes</h2>
          </div>
        </CardContainer>
      </div>
    </div>
  );
};

export default Home;