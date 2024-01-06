import { formatInTimeZone } from "date-fns-tz";
import ptbr from "date-fns/locale/pt-BR";
import Duration from "@/components/Duration";
import { deleteRecord } from "../actions";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function RecordDetails({record, now, setOptimisticRecords}) {
  return (
    <>
    <Drawer>
      <DrawerTrigger asChild>
        <button className="p-4 flex justify-between w-full">
          <div>
            <Time date={record.begin} /> -{" "}
            {record.end && <Time date={record.end} />}
          </div>
          <Duration records={[record]} now={now}/>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Detalhes do registro</DrawerTitle>
            <DrawerDescription>No dia {formatInTimeZone(
                      new Date(record.begin),
                      "America/Sao_Paulo",
                      "dd 'de' MMMM",
                      { locale: ptbr }
                    )}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
            <Time date={record.begin} /><span>-</span>
            {record.end && <Time date={record.end} />}
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <form action={async () => {
                setOptimisticRecords({action: 'delete', newRecord: record})
                await deleteRecord(record.id);
              }}>
              <button type="submit" className="w-full text-red-700">Deletar registro</button>
              </form>
            </DrawerClose>
            <DrawerClose asChild>
              <button>Fechar</button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
    </>
  )
}

function Time({ date }) {
  return (
    <span>
      <span>
        {formatInTimeZone(new Date(date), "America/Sao_Paulo", "HH:mm")}
      </span>
      <span className="text-sm text-gray-400">
        {formatInTimeZone(new Date(date), "America/Sao_Paulo", ":ss")}
      </span>
    </span>
  );
}

