'use client'

import { Project } from "next/dist/build/swc/types";
import Image from "next/image";
import {useState} from 'react'

export default function Root() {

  const [currentTab, setCurrentTab] = useState<ProjectEnumType>(ProjectEnum.FRONT_END)

  // see note about context, this feels wrong having to repeat the function here
  const [tabs, setTabs] = useState<Tab<ProjectEnumType>[]>([
    {e : ProjectEnum.FRONT_END, setCurrentTab : setCurrentTab},
    {e : ProjectEnum.SOMETHING, setCurrentTab : setCurrentTab},
    // TODO: figure out how to make this tab a special case and have not just a solid color for a tab, or maybe each tab gets their own style
    {e : ProjectEnum.PRIMITIVE_ARPG, setCurrentTab : setCurrentTab},
  ])

  
  return (
    <div
    style = {{
      display : 'flex',
      flexDirection : 'column',
      backgroundColor : '#121212',
      alignContent : 'center',
      height : '100vh',
    }}>
      <div
      style = {{
        textAlign : 'center',
        backgroundColor : '#121212',
      }}>
        <h1 className="text-4xl font-bold mt-2 mb-2">
          Nicholas Paganetti Portfolio
        </h1>
        <p>
          I'm an independent game/game engine programmer who is looking for a role in the Software Engineering industry
        </p>     
        <a href="https://github.com/npportfolio" target="_blank" rel="noopener noreferrer" className="inline-flex w-1/10">
          <img src="./Github_Lockup_White_Clearspace.svg" className="githubImage"></img>
        </a>
        <p>
          <span className = "text-xl font-bold">CONTACT: </span>
          napaganetti@gmail.com
        </p>
        <p>
          <span className = "text-xl font-bold">EDUCATION: </span>Bachelor of Science in Computer Science, Worcester Polytechnic Institute
        </p>
        <p>
          Some text thing here
        </p>
        <p>
          Some text thing here
        </p>
      </div>
      <TabBar tabs = {tabs} setCurrentTab = {setCurrentTab} />
      <ProjectOverview projectEnum={currentTab}/>
    </div>
  )
}

export const ProjectEnum = {
  FRONT_END: "FRONT_END",
  SOMETHING: "SOMETHING",
  PRIMITIVE_ARPG: "PRIMITIVE_ARPG",
} as const;

export type ProjectEnumType = typeof ProjectEnum[keyof typeof ProjectEnum];

function projectEnumBackgroundColor (projectEnum : ProjectEnumType) {

  switch (projectEnum) {
    case ProjectEnum.FRONT_END:
      return 'darkred'
    case ProjectEnum.SOMETHING:
      return 'purple'
    case ProjectEnum.PRIMITIVE_ARPG:
      return 'darkGreen'
  }
}

function projectEnumClassName (projectEnum : ProjectEnumType) {

  switch (projectEnum) {
    case ProjectEnum.PRIMITIVE_ARPG:
      return 'greenCheckered'
    default:
      return ''
  }
}

function projectEnumPage (projectEnum : ProjectEnumType) {
  switch (projectEnum) {
    case ProjectEnum.FRONT_END:
      return (
        <div>
          <div className = "text-center pt-2">
            <h2 className = "rounded-t-lg inline-block bg-[#121212] text-center text-2xl font-bold px-2">
              React Reward Wheel
            </h2>
          </div>
          <div className = "bg-[#121212] px-4 mx-auto w-9/10 rounded-lg pt-4">
            <p>
              In addition to this portfolio site, created a reward wheel using React to learn/relearn the basics of front end web development
            </p>
            <div 
            style ={{
              display : 'flex',
              justifyContent : 'center',
            }}>
              <a
                href = "https://npportfolio.github.io/React_Reward_Wheel"
                target="_blank" 
                rel="noopener noreferrer"
                className = "runInNewWindowButton"
                style = {{
                  '--background-color' : projectEnumBackgroundColor(projectEnum),
                  //backgroundColor : projectEnumBackgroundColor(projectEnum),
                } as React.CSSProperties}
                >
                RUN IN NEW WINDOW
              </a>
            </div>
          </div>
        </div>
      )
    case ProjectEnum.SOMETHING:
      return (
        <div>
          COMING SOON test
        </div>
      )
    case ProjectEnum.PRIMITIVE_ARPG:
      return (
        <div>
          <h1>
            PRIMITIVE ARPG
          </h1>
        </div>
      )
  }
}

interface ProjectOverviewProps {
  projectEnum : ProjectEnumType,
}
// container that has description and images maybe
function ProjectOverview({projectEnum} : ProjectOverviewProps) {

  // TODO: have the videos of the game as the background, which also solves the grid pattern being not lined up

  return (
    <div
    className={projectEnumClassName(projectEnum)}
    style = {{
      backgroundColor : projectEnumBackgroundColor(projectEnum),
      flexGrow : '1',
    }}>
      {projectEnumPage(projectEnum)}
    </div>
  )
}

interface TabBarProps<T> {
  tabs : Tab<T>[],
  setCurrentTab : React.Dispatch<React.SetStateAction<ProjectEnumType>>
}
function TabBar({tabs, setCurrentTab} : TabBarProps<ProjectEnumType>) {

  return (
    <div
    style = {{
      display : 'flex'
    }}>
      {
        tabs.map((tab) => (
          <Tab
            key = {tab.e}
            e = {tab.e}
            setCurrentTab={setCurrentTab}
          />
        ))
      }
    </div>
  )
}

interface Tab<T> {
  e : T,
  // TODO: look into context more, can have global things and no need to repeat this every tab?
  setCurrentTab : React.Dispatch<React.SetStateAction<T>>
}

function Tab({e, setCurrentTab} : Tab<ProjectEnumType>) {

  const handleMouseDown = () => {
    setCurrentTab(e)
  }


  let className = ""

  if (e == ProjectEnum.PRIMITIVE_ARPG) {
    className = "greenCheckered"
  }

  return (
    <div
      style = {{
        overflow : 'hidden',
        paddingTop : '10px',
        flexGrow : '1',
        flexShrink : '1',
        flexBasis : '0',
      }}>
      <div
        className={projectEnumClassName(e)}
        style = {{
          backgroundColor : projectEnumBackgroundColor(e),
          textAlign : 'center',
          fontWeight : 'bold',
          fontSize : '1.2rem',
          borderRadius: '40px 40px 0 0',
          filter : 'drop-shadow(0 0 10px black)'// + color + ')'
        }}
        onMouseDown={handleMouseDown}
      >
        {ProjectEnum[e]}
      </div>
    </div>
  )
}