import React from 'react'
import { Card } from 'components/ui'

const Error = () => {

    return (
        <div className="flex flex-auto flex-col">
            <div className="flex flex-auto min-w-0">
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 justify-center items-center text-center">
                    <Card 
                        header={<span>Error</span>}
                        headerClass="font-semibold text-lg"
                        bodyClass="text-center"
                    >
                        <p>
                            There was an error loading the page. Please make sure the internet connection is stable and try again.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
    
}

export default Error
