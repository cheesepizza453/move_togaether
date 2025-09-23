export default function IconRightArrow (props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 9 16" fill="none">
            <path d="M1 1L8 8" stroke={props.fill || '#FFD044'} strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
            <path d="M1 15L8 8" stroke={props.fill || '#FFD044'} strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"/>
        </svg>
    )
}
