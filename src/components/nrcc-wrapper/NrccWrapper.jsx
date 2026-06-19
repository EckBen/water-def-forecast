import banner from './images/banner.png';
import acisLogo from './images/acis-transparent.png';
import noaaLogo from './images/noaa-transparent.png';
import rccLogo from './images/rcc-transparent.png';
import cornellLogo from './images/cornell-transparent.png';

import './NrccWrapper.styles.css';

export default function NrccWrapper({ children }) {
  return (
    <div className="nrcc-wrapper">
      <div className="nrcc-container">
        
        <header>
          <a href='https://www.nrcc.cornell.edu/'>
            <img src={banner} alt='Northeast Regional Climate Center banner' />
          </a>
        </header>
        
        <main className='nrcc-main'>
          {children}
        </main>
        
        <footer className="nrcc-footer">
          <div className="nrcc-footer-col-1">
            <p className="nrcc-mb">
              <span>NRCC supports a three-tiered national climate services support program. The partners include: </span>
              <a className="nrcc-link" href="https://www.stateclimate.org/" rel='noreferrer' target="_blank">State Climate Offices</a>, 
              <a className="nrcc-link" href="https://www.ncdc.noaa.gov/customer-support/partnerships/regional-climate-centers" rel='noreferrer' target="_blank">Regional Climate Centers</a>
              <span>, and  </span>
              <a className="nrcc-link" href="https://www.ncei.noaa.gov/" rel='noreferrer' target="_blank">the National Centers for Environmental Information</a>.
            </p>
            <p className='nrcc-mb-0'><strong>Contact NRCC</strong></p>
            <p className="nrcc-mb">2122 Snee Hall, Cornell University, Ithaca, NY 14853 </p>
            <p className="nrcc-mb">Phone: 607-255-1751 | Fax: 607-255-2106</p>
            <p className="nrcc-mb" id="copyright">© 2026 Northeast Regional Climate Center</p>
          </div>
          
          <div className="nrcc-footer-col-2">
            <p className="nrcc-mb"><a className="nrcc-link" href="/footer/mission.html">Mission Statement</a></p>
            <p className="nrcc-mb"><a className="nrcc-link" href="/footer/personnel.html">Personnel</a></p>
            <p className="nrcc-mb"><a className="nrcc-link" href="/footer/links.html">Links</a></p>
            <p className="nrcc-mb"><a className="nrcc-link" href="/footer/contact.html">Contact</a></p>
            <p className="nrcc-mb">website design: <a className="text-[#53682C]! underline!" href="http://knowledgetown.com" rel='noreferrer' target="_blank">Knowledge Town</a></p>
          </div>
          
          <div className="nrcc-footer-col-3">
            <div className="nrcc-logo-container">
              <a href="https://www.rcc-acis.org/" rel='noreferrer' target="_blank">
                <img src={acisLogo} alt="Powered by ACIS (Applied Climate Information System)" />
              </a>
            </div>
        
            <div className="nrcc-logo-container">
              <a href="https://www.ncei.noaa.gov/" rel='noreferrer' target="_blank">
                <img src={noaaLogo} alt="NOAA National Centers for Environmental Information" />
              </a>
            </div>
        
            <div className="nrcc-logo-container">
              <a href="https://www.ncei.noaa.gov/regional/regional-climate-centers" rel='noreferrer' target="_blank">
                <img src={rccLogo} alt="Regional Climate Centers" />
              </a>
            </div>
        
            <div className="nrcc-logo-container">
              <a href="https://www.cornell.edu/" rel='noreferrer' target="_blank">
                <img src={cornellLogo} alt="Cornell University" />
              </a>
            </div>
          </div>			
        </footer>
      </div>
    </div>
  );
}