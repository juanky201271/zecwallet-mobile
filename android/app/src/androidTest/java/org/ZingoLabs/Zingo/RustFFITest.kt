package org.ZingoLabs.Zingo

import com.google.common.truth.Truth.assertThat
import org.junit.Test
import org.junit.experimental.categories.Category
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue

object Seeds {
    const val ABANDON = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art"
    const val HOSPITAL = "hospital museum valve antique skate museum unfold vocal weird milk scale social vessel identify crowd hospital control album rib bulb path oven civil tank"
}

object Ufvk {
    const val ABANDON = "uview1vmle9qzgsmzn8qskg06cjjt406eq3euvkn8un3t6sk7fjd72qp72guyskktr2gvgcpmd99qgquxdw7s54v0dfxn3degzhxp9gmvpve6vlvv459pxfre05v6l47aqx47rgh86t6n77svstd8ff6d8cwtn98uq66k6u5jqrpyz0pqflkppfq3djscrd2acnc7ymkd6fssk0t4rh2ynaux7z4ylt38jqgjhnu88h2jz8qwd3t5dwsc3ycvsea6grs4zg76r9vw48r9zvlphnpfsgc5eqpum7hghdm2eguw4h6n9m8rhuzh0qdc24z4z5ftcv6xxvvs3yrugea23xlys3f9qv0fenh0xp0hej8enlr82esl54hn27d6432kygwqx700ez84e72f03vtmece73dftpjvv3v7w65yaz2rjwmarxjzrnn02u5kx4p7a42k5lxgcgqgwjyp9w6x24ccm0dvlf4637ss6l3xmuv2strza60c5k5uasdcn"
}

data class InitFromSeed (
    val seed : String,
    val birthday : Long,
    val account_index: Long
)

data class InitFromUfvk (
    val error : String
)

data class ExportUfvk (
    val ufvk : String,
    val birthday : Long
)

data class Addresses (
	val address : String,
	val receivers : Receivers
)

data class Receivers (
	val transparent : String,
	val sapling : String,
	val orchard_exists : Boolean
)

data class Info (
    val version : String,
    val git_commit : String,
    val server_uri : String,
    val vendor : String,
    val taddr_support : Boolean,
    val chain_name : String,
    val sapling_activation_height : Long,
    val consensus_branch_id : String,
    val latest_block_height : Long
)

data class Height (
	val height : Long
)

data class SyncStatus (
	val sync_id : Long,
    val in_progress : Boolean,
    val last_error : String?
)

data class Sync (
	val result : String,
    val latest_block : Long,
    val total_blocks_synced : Long
)

data class Balance (
    val sapling_balance : Long,
    val verified_sapling_balance : Long,
    val spendable_sapling_balance : Long,
    val unverified_sapling_balance : Long,
    val orchard_balance : Long,
    val verified_orchard_balance : Long,
    val spendable_orchard_balance : Long,
    val unverified_orchard_balance : Long,
    val transparent_balance : Long
)

data class Send (
    val address : String,
    val amount : Long,
    val memo : String?
)

data class ValueTransfer (
    val txid : String,
    val datetime : Long,
    val status: String,
    val blockheight : Long,
    val transaction_fee : Long?,
    val zec_price : Long?,
    val kind : String,
    val value : Long,
    val recipient_address : String?,
    val pool_received : String?,
    val memos : List<String>?,
)

data class ValueTransfers (
    val value_transfers : List<ValueTransfer>,
)

@Category(OfflineTest::class)
class ExecuteAddressesFromSeed {
    @Test
    fun executeAddressesFromSeed() {
        val mapper = jacksonObjectMapper()

        val server = "http://10.0.2.2:20000"
        val chainhint = "main"
        val seed = Seeds.ABANDON
        val birthday:ULong = 1u
        val datadir = MainApplication.getAppContext()!!.filesDir.path
        val monitorMempool = false

        val initFromSeedJson: String = uniffi.zingo.initFromSeed(server, seed, birthday, datadir, chainhint, monitorMempool)
        println("\nInit from seed:")
        println(initFromSeedJson)
        val initFromSeed: InitFromSeed = mapper.readValue(initFromSeedJson)
        assertThat(initFromSeed.seed).isEqualTo(Seeds.ABANDON)
        assertThat(initFromSeed.birthday).isEqualTo(1)

        val addressesJson: String = uniffi.zingo.executeCommand("addresses", "")
        println("\nAddresses:")
        println(addressesJson)
        val addresses: List<Addresses> = mapper.readValue(addressesJson)
        assertThat(addresses[0].address).isEqualTo("u16sw4v6wy7f4jzdny55yzl020tp3yqg3c85dc6n7mmq0urfm6adqg79hxmyk85ufn4lun4pfh5q48cc3kvxhxm3w978eqqecdd260gkzjrkun6z7m9mcrt2zszaj0mvk6ufux2zteqwh57cq906hz3rkg63duaeqsvjelv9h5srct0zq8rvlv23wz5hed7zuatqd7p6p4ztugc4t4w2g")
        assertThat(addresses[0].receivers.transparent).isEqualTo("t1dUDJ62ANtmebE8drFg7g2MWYwXHQ6Xu3F")
        assertThat(addresses[0].receivers.sapling).isEqualTo("zs16uhd4mux24se6wkm74vld0ec63d4dxt3d7m80l5xytreplkkllrrf9c7fj859mhp8tkcq9hxfvj")
        assertThat(addresses[0].receivers.orchard_exists).isEqualTo(true)
    }
}

@Category(OfflineTest::class)
class ExecuteAddressesFromUfvk {
    @Test
    fun executeAddressFromUfvk() {
        val mapper = jacksonObjectMapper()

        val server = "http://10.0.2.2:20000"
        val chainhint = "main"
        val ufvk = Ufvk.ABANDON
        val birthday: ULong = 1u
        val datadir = MainApplication.getAppContext()!!.filesDir.path
        val monitorMempool = false

        val initFromUfvkJson: String = uniffi.zingo.initFromUfvk(server, ufvk, birthday, datadir, chainhint, monitorMempool)
        println("\nInit From UFVK:")
        println(initFromUfvkJson)
        val initFromUfvk: InitFromUfvk = mapper.readValue(initFromUfvkJson)
        assertThat(initFromUfvk.error).startsWith("This wallet is watch-only")

        val exportUfvkJson: String = uniffi.zingo.executeCommand("exportufvk", "")
        println("\nExport Ufvk:")
        println(exportUfvkJson)
        val exportUfvk: ExportUfvk = mapper.readValue(exportUfvkJson)
        assertThat(exportUfvk.ufvk).isEqualTo(Ufvk.ABANDON)
        assertThat(exportUfvk.birthday).isEqualTo(1)

        val addressesJson: String = uniffi.zingo.executeCommand("addresses", "")
        println("\nAddresses:")
        println(addressesJson)
        val addresses: List<Addresses> = mapper.readValue(addressesJson)
        assertThat(addresses[0].address).isEqualTo("u16sw4v6wy7f4jzdny55yzl020tp3yqg3c85dc6n7mmq0urfm6adqg79hxmyk85ufn4lun4pfh5q48cc3kvxhxm3w978eqqecdd260gkzjrkun6z7m9mcrt2zszaj0mvk6ufux2zteqwh57cq906hz3rkg63duaeqsvjelv9h5srct0zq8rvlv23wz5hed7zuatqd7p6p4ztugc4t4w2g")
        assertThat(addresses[0].receivers.transparent).isEqualTo("t1dUDJ62ANtmebE8drFg7g2MWYwXHQ6Xu3F")
        assertThat(addresses[0].receivers.sapling).isEqualTo("zs16uhd4mux24se6wkm74vld0ec63d4dxt3d7m80l5xytreplkkllrrf9c7fj859mhp8tkcq9hxfvj")
        assertThat(addresses[0].receivers.orchard_exists).isEqualTo(true)
    }    
}

@Category(OfflineTest::class)
class ExecuteVersionFromSeed {
    @Test
    fun executeVersionFromSeed() {
        val mapper = jacksonObjectMapper()

        val server = "http://10.0.2.2:20000"
        val chainhint = "main"
        val seed = Seeds.ABANDON
        val birthday:ULong = 1u
        val datadir = MainApplication.getAppContext()!!.filesDir.path
        val monitorMempool = false

        val initFromSeedJson: String = uniffi.zingo.initFromSeed(server, seed, birthday, datadir, chainhint, monitorMempool)
        println("\nInit from seed:")
        println(initFromSeedJson)
        val initFromSeed: InitFromSeed = mapper.readValue(initFromSeedJson)
        assertThat(initFromSeed.seed).isEqualTo(Seeds.ABANDON)
        assertThat(initFromSeed.birthday).isEqualTo(1)

        val version: String = uniffi.zingo.executeCommand("version", "")
        println("\nVersion:")
        println(version)
        assertThat(version).isNotNull()
        assertThat(version).isNotEmpty()
        assertThat(version).isNotEqualTo("")
    }
}

class ExecuteSyncFromSeed {
    @Test
    fun executeSyncFromSeed() {
        val mapper = jacksonObjectMapper()

        val server = "http://10.0.2.2:20000"
        val chainhint = "regtest"
        val seed = Seeds.ABANDON
        val birthday:ULong = 1u
        val datadir = MainApplication.getAppContext()!!.filesDir.path
        val monitorMempool = false

        val initFromSeedJson: String = uniffi.zingo.initFromSeed(server, seed, birthday, datadir, chainhint, monitorMempool)
        println("\nInit from seed:")
        println(initFromSeedJson)
        val initFromSeed: InitFromSeed = mapper.readValue(initFromSeedJson)
        assertThat(initFromSeed.seed).isEqualTo(Seeds.ABANDON)
        assertThat(initFromSeed.birthday).isEqualTo(1)

        val infoJson: String = uniffi.zingo.executeCommand("info", "")
        println("\nInfo:")
        println(infoJson)
        val info: Info = mapper.readValue(infoJson)
        assertThat(info.latest_block_height).isGreaterThan(0)

        var heightJson: String = uniffi.zingo.executeCommand("height", "")
        println("\nHeight pre-sync:")
        println(heightJson)
        val heightPreSync: Height = mapper.readValue(heightJson)
        assertThat(heightPreSync.height).isEqualTo(0)

        val syncJson: String = uniffi.zingo.executeCommand("sync", "")
        println("\nSync:")
        println(syncJson)
        val sync: Sync = mapper.readValue(syncJson)
        assertThat(sync.result).isEqualTo("success")
        assertThat(sync.latest_block).isEqualTo(info.latest_block_height)
        assertThat(sync.total_blocks_synced).isEqualTo(info.latest_block_height)

        heightJson = uniffi.zingo.executeCommand("height", "")
        println("\nHeight post-sync:")
        println(heightJson)
        val heightPostSync: Height = mapper.readValue(heightJson)
        assertThat(heightPostSync.height).isEqualTo(info.latest_block_height)

        val syncStatusJson: String = uniffi.zingo.executeCommand("syncstatus", "")
        println("\nSync status:")
        println(syncStatusJson)
        val syncStatus: SyncStatus = mapper.readValue(syncStatusJson)
        assertThat(syncStatus.sync_id).isEqualTo(1)
    }
}

class ExecuteSendFromOrchard {
    @Test
    fun executeSendFromOrchard() {
        val mapper = jacksonObjectMapper()

        val server = "http://10.0.2.2:20000"
        val chainhint = "regtest"
        val seed = Seeds.HOSPITAL
        val birthday:ULong = 1u
        val datadir = MainApplication.getAppContext()!!.filesDir.path
        val monitorMempool = false

        val initFromSeedJson: String = uniffi.zingo.initFromSeed(server, seed, birthday, datadir, chainhint, monitorMempool)
        println("\nInit from seed:")
        println(initFromSeedJson)
        val initFromSeed: InitFromSeed = mapper.readValue(initFromSeedJson)
        assertThat(initFromSeed.seed).isEqualTo(Seeds.HOSPITAL)
        assertThat(initFromSeed.birthday).isEqualTo(1)

        var syncJson: String = uniffi.zingo.executeCommand("sync", "")
        println("\nSync:")
        println(syncJson)

        var balanceJson: String = uniffi.zingo.executeCommand("balance", "")
        println("\nBalance pre-send:")
        println(balanceJson)
        val balancePreSend: Balance = mapper.readValue(balanceJson)
        assertThat(balancePreSend.spendable_orchard_balance).isEqualTo(1000000)
        assertThat(balancePreSend.transparent_balance).isEqualTo(0)

        val addressesJson: String = uniffi.zingo.executeCommand("addresses", "")
        println("\nAddresses:")
        println(addressesJson)
        val addresses: List<Addresses> = mapper.readValue(addressesJson)

        val send = Send(addresses[0].receivers.transparent, 100000, null)

        val proposeJson: String = uniffi.zingo.executeCommand("send", mapper.writeValueAsString(listOf(send)))
        println("\nPropose:")
        println(proposeJson)

        val sendProgressJson: String = uniffi.zingo.executeCommand("sendprogress", "")
        println("\nSend progress:")
        println(sendProgressJson)

        val confirmJson: String = uniffi.zingo.executeCommand("confirm", "")
        println("\nConfirm Txid:")
        println(confirmJson)

        syncJson = uniffi.zingo.executeCommand("sync", "")
        println("\nSync:")
        println(syncJson)

        balanceJson = uniffi.zingo.executeCommand("balance", "")
        println("\nBalance post-send:")
        println(balanceJson)
        val balancePostSend: Balance = mapper.readValue(balanceJson)
        assertThat(balancePostSend.transparent_balance).isEqualTo(100000)
    }
}

class UpdateCurrentPriceAndValueTransfersFromSeed {
    @Test
    fun updateCurrentPriceAndValueTransfersFromSeed() {
        val mapper = jacksonObjectMapper()

        val server = "http://10.0.2.2:20000"
        val chainhint = "regtest"
        val seed = Seeds.HOSPITAL
        val birthday:ULong = 1u
        val datadir = MainApplication.getAppContext()!!.filesDir.path
        val monitorMempool = false

        val initFromSeedJson: String = uniffi.zingo.initFromSeed(server, seed, birthday, datadir, chainhint, monitorMempool)
        println("\nInit from seed:")
        println(initFromSeedJson)
        val initFromSeed: InitFromSeed = mapper.readValue(initFromSeedJson)
        assertThat(initFromSeed.seed).isEqualTo(Seeds.HOSPITAL)
        assertThat(initFromSeed.birthday).isEqualTo(1)

        val price: String = uniffi.zingo.executeCommand("updatecurrentprice", "")
        println("\nPrice:")
        println(price)

        val syncJson: String = uniffi.zingo.executeCommand("sync", "")
        println("\nSync:")
        println(syncJson)

        val valueTranfersJson: String = uniffi.zingo.getValueTransfers()
        println("\nValue Transfers:")
        println(valueTranfersJson)
        val valueTranfers: ValueTransfers = mapper.readValue(valueTranfersJson)
        // the value transfers have 3 items for 3 different txs
        // 1. Received - 1_000_000 - orchard (1 item)
        // 2. Sent - 110_000 - uregtest1zkuzfv5m3... (1 item)
        // 3. sendToSelf - 10_000 (1 item)
        assertThat(valueTranfers.value_transfers.size).isEqualTo(3)
        // first item have to be a `Received`
        assertThat(valueTranfers.value_transfers[0].kind).isEqualTo("received")
        assertThat(valueTranfers.value_transfers[0].pool_received).isEqualTo("Orchard")
        assertThat(valueTranfers.value_transfers[0].status).isEqualTo("confirmed")
        assertThat(valueTranfers.value_transfers[0].value).isEqualTo(1000000)
        // second item have to be a `Sent`
        assertThat(valueTranfers.value_transfers[1].kind).isEqualTo("sent")
        assertThat(valueTranfers.value_transfers[1].recipient_address).isEqualTo("uregtest1zkuzfv5m3yhv2j4fmvq5rjurkxenxyq8r7h4daun2zkznrjaa8ra8asgdm8wwgwjvlwwrxx7347r8w0ee6dqyw4rufw4wg9djwcr6frzkezmdw6dud3wsm99eany5r8wgsctlxquu009nzd6hsme2tcsk0v3sgjvxa70er7h27z5epr67p5q767s2z5gt88paru56mxpm6pwz0cu35m")
        assertThat(valueTranfers.value_transfers[1].status).isEqualTo("confirmed")
        assertThat(valueTranfers.value_transfers[1].value).isEqualTo(100000)
        assertThat(valueTranfers.value_transfers[1].transaction_fee).isEqualTo(10000)
        // third item have to be a `fee` from the last `Sent` with the same txid
        assertThat(valueTranfers.value_transfers[2].kind).isEqualTo("send-to-self")
        assertThat(valueTranfers.value_transfers[2].status).isEqualTo("confirmed")
        assertThat(valueTranfers.value_transfers[2].value).isEqualTo(0)
        assertThat(valueTranfers.value_transfers[2].transaction_fee).isEqualTo(10000)
    }
}

class ExecuteSaplingBalanceFromSeed {
    @Test
    fun executeSaplingBalanceFromSeed() {
        val mapper = jacksonObjectMapper()

        val server = "http://10.0.2.2:20000"
        val chainhint = "regtest"
        val seed = Seeds.HOSPITAL
        val birthday:ULong = 1u
        val datadir = MainApplication.getAppContext()!!.filesDir.path
        val monitorMempool = false

        val initFromSeedJson: String = uniffi.zingo.initFromSeed(server, seed, birthday, datadir, chainhint, monitorMempool)
        println("\nInit from seed:")
        println(initFromSeedJson)
        val initFromSeed: InitFromSeed = mapper.readValue(initFromSeedJson)
        assertThat(initFromSeed.seed).isEqualTo(Seeds.HOSPITAL)
        assertThat(initFromSeed.birthday).isEqualTo(1)

        val syncJson:String = uniffi.zingo.executeCommand("sync", "")
        println("\nSync:")
        println(syncJson)
        
        val valueTranfersJson: String = uniffi.zingo.getValueTransfers()
        println("\nValue Transfers:")
        println(valueTranfersJson)

        // Value Transfers
        // 1. Received in orchard pool =     +500_000
        // 2. Received in sapling pool =     +250_000
        // 3. Received in transparent pool = +250_000
        // 4. Send - 100_000 + 10_000fee =   -110_000
        // 5. MemoToSelf orchard pool =       -10_000 (one item: Fee)
        // 6. MemoToSelf sapling pool =       -10_000 (one item: Fee)
        // 7. MemoToSelf transparent pool =   -10_000 (two items: MemoToSelf & Fee)
        // 8. Shielding transparent pool =    -10_000 (one item: Fee)
        // 9. Upgrading sapling pool =        -10_000 (one item: Fee)
        //
        // orchard pool = 840_000
        // sapling pool = 0
        // transparent =  0

        val balanceJson:String = uniffi.zingo.executeCommand("balance", "")
        println("\nBalance:")
        println(balanceJson)
        val balance: Balance = mapper.readValue(balanceJson)

        assertThat(balance.orchard_balance).isEqualTo(840000)
        assertThat(balance.verified_orchard_balance).isEqualTo(840000)
        assertThat(balance.spendable_orchard_balance).isEqualTo(840000)
        assertThat(balance.sapling_balance).isEqualTo(0)
        assertThat(balance.verified_sapling_balance).isEqualTo(0)
        assertThat(balance.spendable_sapling_balance).isEqualTo(0)
        assertThat(balance.transparent_balance).isEqualTo(0)
    }
}
