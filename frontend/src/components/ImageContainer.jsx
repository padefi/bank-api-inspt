import { Carousel, Image } from "react-bootstrap";
import first from '../img/first.jpg';
import second from '../img/second.jpg';
import third from '../img/third.jpg';

export default function ImageContainer({ children }) {
    return (
        <div className='box rtd-layout mb-3'>
            <Carousel>
                <Carousel.Item>
                    <Image id="FirstImg" className="d-block w-100" src={first} alt="First slide" />
                </Carousel.Item>
                <Carousel.Item>
                    <Image id="SecondImg" className="d-block w-100" src={second} alt="Second slide" />
                </Carousel.Item>
                <Carousel.Item>
                    <Image id="ThirdImg" className="d-block w-100" src={third} alt="Third slide" />
                </Carousel.Item>
            </Carousel>
        </div>
    );
}