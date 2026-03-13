const StarBorder = ({
as: Component = "button",
className = "",
color = "#7c3aed",
speed = "6s",
thickness = 1,
children,
...rest
}) => {
return (
<Component
className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
style={{
padding: `${thickness}px`,
...rest.style,
}}
{...rest}
>
{/* moving stars */}
<div
className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom"
style={{
background: `radial-gradient(circle, ${color}, transparent 10%)`,
animationDuration: speed,
}}
/>

```
  <div
    className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top"
    style={{
      background: `radial-gradient(circle, ${color}, transparent 10%)`,
      animationDuration: speed,
    }}
  />

  {/* button content */}
  <div className="relative z-[1] bg-gradient-to-b from-black to-gray-900 border border-gray-800 text-white text-sm px-4 py-2 rounded-xl">
    {children}
  </div>
</Component>


);
};

export default StarBorder;

// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       animation: {
//         'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
//         'star-movement-top': 'star-movement-top linear infinite alternate',
//       },
//       keyframes: {
//         'star-movement-bottom': {
//           '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
//           '100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
//         },
//         'star-movement-top': {
//           '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
//           '100%': { transform: 'translate(100%, 0%)', opacity: '0' },
//         },
//       },
//     },
//   }
// }
