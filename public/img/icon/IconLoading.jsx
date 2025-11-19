export default function IconLoading({text, className}){
    return (
        <div className={'flex flex-col items-center animate-sweep'}>
            <figure className={'w-[120px]'}>
                <img className={'w-full'} src={'/img/loading.gif'} alt={''}/>
            </figure>
            <p className={
                `text-16-m text-brand-main text-center ${className}`}>{text || 'Loading...'}</p>
        </div>
    )
}