import React, { useEffect } from 'react'
import { Helmet } from "react-helmet"
import IframeResizer from 'iframe-resizer-react'
import { useSelector } from 'react-redux'

const Analytics = () => {

	var aurl= useSelector((state) => state.userData.author.aurl)
	var mode= useSelector((state) => state.theme.mode)
    var urlMode = (mode === "light") ? "&embed=true&theme=light&background=transparent" : "&embed=true&theme=dark&background=transparent"
    var aURL = aurl + urlMode

    useEffect(() => {
        console.log(mode)
        console.log(aURL)
    }, [])
    //test
	return (
		<div>
            <div>
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>Home Page</title>
                    <script async src="https://plausible.io/js/embed.host.js"></script> 
                </Helmet>
                <div className='w-full h-1600'>
                    <IframeResizer
                        log
                        src={aURL}
                        style={{ width: '1px', minWidth: '100%'}}
                    />
                    {/* <Iframe plausible-embed url="https://plausible.io/share/testname2.inkflow.tk?auth=5tAIfsI_n9c6SRlaxa4XO&embed=true&theme=system"
                    className='w-full h-1600'
                    display="block"
                    scrolling='auto'
                    frameBorder={0}
                    loading='lazy'/> */}
                </div>	
                {/* <iframe plausible-embed src="https://plausible.io/share/testname2.inkflow.tk?auth=5tAIfsI_n9c6SRlaxa4XO&embed=true&theme=system" scrolling="no" frameborder="0" loading="lazy" style="width: 1px; min-width: 100%; height: 1600px;"></iframe>
                <div style="font-size: 14px; padding-bottom: 14px;">Stats powered by <a target="_blank" style="color: #4F46E5; text-decoration: underline;" href="https://plausible.io">Plausible Analytics</a></div>
                <script async src="https://plausible.io/js/embed.host.js"></script> */}
            </div>
			{/* <Button block onClick={googlesignOut} variant="solid" type="submit">
				Signout
			</Button> */}
		</div>
		
	)
}

export default Analytics