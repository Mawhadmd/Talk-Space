import { AnimatePresence, motion } from "motion/react";

export const EntryRequestNotification = ({handleaccept,entryRequest}: {handleaccept: (id:string) => void, entryRequest:Set<{ id: string; name: string }> }) => {
    return (
      <>
        <AnimatePresence>
            {entryRequest &&
              Array.from(entryRequest.values()).map(
                (e: { id: string; name: string }, i) => (
                  <motion.div
                    initial={{ y: 100 * i, x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    key={e.id} // Key prop should be on the motion.div
                    className="w-[300px] h-20 flex top-0 right-0 m-1 justify-center text-white items-center p-4 bg-black rounded-full fixed"
                  >
                    <p>{e.name} wants to connect (Ignore to refuse)</p>
                    <button
                      onClick={() => handleaccept(e.id)}
                      className="bg-white text-black font-semibold whitespace-nowrap p-1 rounded-md"
                    >
                      Let in
                    </button>
                  </motion.div>
                )
              )}
          </AnimatePresence>
      </>
    );
  }